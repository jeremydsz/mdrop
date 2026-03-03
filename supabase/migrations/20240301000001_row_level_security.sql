-- MDrop Row Level Security Policies
-- This migration sets up RLS for all tables

-- Enable RLS on all tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Notes Policies
-- Anyone can read notes (public read for shared links)
CREATE POLICY "Notes are publicly readable"
  ON notes FOR SELECT
  USING (true);

-- Only authenticated users can insert notes (they become the author)
CREATE POLICY "Authenticated users can create notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = author_id);

-- Only the author can update their own notes
CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = author_id)
  WITH CHECK (auth.uid()::text = author_id);

-- Only the author can delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid()::text = author_id);

-- Tags Policies
-- Anyone can read tags
CREATE POLICY "Tags are publicly readable"
  ON tags FOR SELECT
  USING (true);

-- Authenticated users can create tags
CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note Tags Policies
-- Anyone can read note-tag associations
CREATE POLICY "Note tags are publicly readable"
  ON note_tags FOR SELECT
  USING (true);

-- Only note author can add tags to their notes
CREATE POLICY "Note authors can add tags"
  ON note_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_id
      AND notes.author_id = auth.uid()::text
    )
  );

-- Only note author can remove tags from their notes
CREATE POLICY "Note authors can remove tags"
  ON note_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_id
      AND notes.author_id = auth.uid()::text
    )
  );

-- Comments Policies
-- Anyone can read comments
CREATE POLICY "Comments are publicly readable"
  ON comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = author_id);

-- Comment author or note author can delete comments
CREATE POLICY "Comment or note author can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING (
    auth.uid()::text = author_id
    OR EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_id
      AND notes.author_id = auth.uid()::text
    )
  );
