-- Multi-user migration: users table, visibility, scoped RLS

-- 1. Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Trigger function: upsert into public.users from auth.users metadata on sign-in
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, image)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    image = EXCLUDED.image;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger on auth.users
CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Attach updated_at trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Backfill users from existing notes and comments author data
INSERT INTO users (id, email, name, image)
SELECT DISTINCT ON (author_id)
  author_id,
  author_id || '@backfill.local',
  author_name,
  author_image
FROM (
  SELECT author_id, author_name, author_image, created_at FROM notes
  UNION ALL
  SELECT author_id, author_name, author_image, created_at FROM comments
) combined
ORDER BY author_id, created_at DESC
ON CONFLICT (id) DO NOTHING;

-- 6. Add foreign keys
ALTER TABLE notes
  ADD CONSTRAINT fk_notes_author FOREIGN KEY (author_id) REFERENCES users(id);

ALTER TABLE comments
  ADD CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id);

-- 7. Add visibility column to notes
ALTER TABLE notes
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'private'));

-- 8. Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are publicly readable"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- 9. Update RLS policies on notes

-- Drop old public-read policy
DROP POLICY "Notes are publicly readable" ON notes;

-- Replace with visibility-aware policy
CREATE POLICY "Notes are readable if public or by author"
  ON notes FOR SELECT
  USING (
    visibility = 'public'
    OR auth.uid()::text = author_id
  );

-- 10. Update RLS policies on comments

-- Drop old public-read policy
DROP POLICY "Comments are publicly readable" ON comments;

-- Replace with policy that checks note accessibility
CREATE POLICY "Comments are readable if note is accessible"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = comments.note_id
      AND (notes.visibility = 'public' OR notes.author_id = auth.uid()::text)
    )
  );

-- Drop old insert policy
DROP POLICY "Authenticated users can create comments" ON comments;

-- Replace with policy that also checks note accessibility
CREATE POLICY "Authenticated users can comment on accessible notes"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = author_id
    AND EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_id
      AND (notes.visibility = 'public' OR notes.author_id = auth.uid()::text)
    )
  );
