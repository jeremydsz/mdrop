# MDrop — Multi-User Migration Plan

## Overview

Migrate MDrop from a single-team tool restricted to `@pockla.com` to an open platform where any Google account can sign in, manage their own notes, and control note visibility.

---

## Current State

- Auth locked to `@pockla.com` via Google OAuth `hd` hint + Supabase Dashboard config
- No `users` table — identity is Supabase Auth metadata, denormalized into `notes` and `comments` as `author_name`/`author_image`
- Dashboard fetches **all notes** with no `author_id` filter — works for a single team, breaks for multi-user
- All notes are publicly readable via link with no visibility control
- 4 tables: `notes`, `tags`, `note_tags`, `comments`

## Target State

- Any Google account can sign in
- Dashboard shows only the authenticated user's own notes
- Notes have a visibility toggle (public / private)
- A `users` table provides stable user identity
- RLS policies enforce visibility at the database level

---

## Phase 1: New `users` Table + Auth Trigger

### New migration: `users` table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### Auto-sync from Supabase Auth

A database trigger on `auth.users` upserts into `public.users` on every sign-in:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    image = EXCLUDED.image,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Every Google sign-in automatically upserts a row in `users`. No app-level code needed for user creation.

### RLS for `users`

- Public read (for displaying author info on notes/comments)
- Update own row only

### Foreign keys

Add FK from `notes.author_id` and `comments.author_id` to `users.id`. Author name and image are JOINed from `users` rather than read from denormalized columns.

---

## Phase 2: Note Visibility

### Add `visibility` column to `notes`

```sql
ALTER TABLE notes ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'private'));
```

### Update RLS

Replace the blanket public-read policy with a visibility-aware one:

```sql
DROP POLICY "Notes are publicly readable" ON notes;

CREATE POLICY "Notes are readable based on visibility"
  ON notes FOR SELECT
  USING (
    visibility = 'public'
    OR auth.uid()::text = author_id
  );
```

Public notes: anyone can read. Private notes: only the author.

---

## Phase 3: Remove `@pockla.com` Restriction

| File | Change |
|------|--------|
| `src/app/login/page.tsx` | Remove `hd: "pockla.com"` from `queryParams`, remove "Restricted to @pockla.com" text |
| `src/components/landing.tsx` | Remove "Restricted to @pockla.com accounts" text |
| Supabase Dashboard | Remove domain restriction from Google OAuth provider settings |

---

## Phase 4: Scope Dashboard to Current User

### `src/app/page.tsx`

The `getNotes()` function currently fetches all notes:

```typescript
// Before
const { data: notes } = await supabase
  .from("notes")
  .select("*")
  .order("created_at", { ascending: false });

// After
const { data: notes } = await supabase
  .from("notes")
  .select("*, users!author_id(name, image)")
  .eq("author_id", user.id)
  .order("created_at", { ascending: false });
```

Tag filtering should also scope to the user's notes only — show only tags that appear on the current user's notes.

---

## Phase 5: Update TypeScript Types + Auth Layer

- Add `User` type to `src/types/database.ts`
- Add `visibility` field to the `Note` type
- Update `NoteWithTags` and related types
- Update `AuthUser` in `src/lib/auth.ts` to optionally read from the `users` table (or continue using Supabase Auth metadata since the trigger keeps them in sync)

---

## Phase 6: Editor UI Changes

- Add a visibility toggle to the note editor (`/new` and `/n/[id]/edit`)
- Default to `public` (preserves current behavior)
- Simple dropdown or toggle: **Public** (anyone with link) vs **Private** (only you)
- Update the share dialog: if private, show a message like "Only you can view this note"

---

## Phase 7: Read View + Comments Adjustments

- **Read view** (`/n/[id]`): RLS handles access control. If a private note is accessed by someone other than the author, the query returns no data — show 404.
- **Comments**: Any authenticated user can comment on public notes. The existing RLS already allows this (`TO authenticated`).
- **Author info**: JOIN from `users` table instead of reading denormalized columns on notes and comments.

---

## Phase 8: Data Migration

For existing data:

1. Backfill `users` table from existing `notes.author_id` / `notes.author_name` / `notes.author_image` values
2. Set `visibility = 'public'` for all existing notes (preserves current behavior)
3. Optionally drop `author_name` and `author_image` from `notes` and `comments` after migration, or keep them and gradually move to JOINs

---

## Phase 9: Documentation Updates

| File | Change |
|------|--------|
| `docs/PRD.md` | Update Auth section, add visibility feature, update data model |
| `docs/guide-to-using-mdrop.md` | Remove pockla references, document visibility toggle |
| `README.md` | Update setup instructions (no domain restriction) |
| `docs/conventions.md` | Update non-negotiable #2 (now 5 tables justified) |

---

## Migration Order

Each step is independently deployable and backward-compatible with the previous state.

1. **Database**: Create `users` table + trigger + visibility column + updated RLS
2. **Types**: Update TypeScript types and auth layer
3. **Dashboard scoping**: Filter notes to current user
4. **Auth opening**: Remove pockla restriction from code + Supabase config
5. **Visibility toggle**: New editor UI for public/private
6. **Read view**: Handle private note access gracefully
7. **Docs**: Update all documentation

---

## Files Affected

### Database / Migrations

- `supabase/migrations/` — new migration file for `users` table, visibility column, RLS updates

### Code

| File | Change |
|------|--------|
| `src/app/login/page.tsx` | Remove `hd` param and pockla text |
| `src/components/landing.tsx` | Remove pockla text |
| `src/app/page.tsx` | Scope `getNotes()` to current user |
| `src/types/database.ts` | Add `User` type, add `visibility` to `Note` |
| `src/lib/auth.ts` | Update to work with `users` table |
| `src/app/new/page.tsx` | Add visibility toggle |
| `src/app/n/[id]/edit/page.tsx` | Add visibility toggle |
| `src/components/editor/*` | Visibility selector component |
| `src/app/n/[id]/page.tsx` | Handle private note → 404 |
| `src/components/share-dialog.tsx` | Private note messaging |
| `src/components/note-list.tsx` | Show visibility indicator |

### Documentation

- `docs/PRD.md`
- `docs/guide-to-using-mdrop.md`
- `docs/conventions.md`
- `README.md`
