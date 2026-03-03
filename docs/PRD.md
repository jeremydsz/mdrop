# MDrop — Product Requirements Document

## One-liner

A zero-friction markdown viewer where you paste, drop, or type markdown and get a shareable link in one click.

---

## Problem

Sharing formatted markdown within a team is surprisingly annoying. You either send raw `.md` files that teammates have to open in an editor, paste messy text into Slack, or spin up a heavyweight wiki nobody wants to maintain. There's no fast path from "I wrote a note" to "here's a pretty link everyone can read."

---

## Principles

| # | Principle | What it means in practice |
|---|-----------|--------------------------|
| 1 | **Lightweight over feature-rich** | If a feature adds weight without solving a core need, it doesn't ship. |
| 2 | **Zero friction** | A new user should go from landing page to shared link in under 30 seconds. |
| 3 | **Intentional UI** | Every element on screen earns its place. No chrome, no sidebar clutter, no settings panels. |
| 4 | **Read-first** | The most common action is *reading* a shared link. That experience must be instant and distraction-free. |

---

## Users

- **Author** — someone in the org who writes and shares markdown notes, docs, or snippets.
- **Reader** — anyone with the link. May or may not be logged in.

---

## Auth

| Requirement | Detail |
|-------------|--------|
| Provider | Google OAuth 2.0, open to any Google account. Single provider keeps it simple. |
| Session persistence | Long-lived session cookie / refresh token so users stay logged in across visits. No repeated login prompts. |
| Who can create | Any Google-authenticated user. |
| Who can read | **Anyone with the link** for public notes — no auth required to view. Private notes are visible only to the author. |

---

## Core Features (v1)

### 1. Create a note

The upload/create experience is the heart of the product. A single interface offers three input modes, selectable via subtle tabs or auto-detected:

| Mode | Behaviour |
|------|-----------|
| **Paste** | Large text area. Paste raw markdown; live preview renders beside or below it. |
| **Drop** | Drag a `.md` file onto the area. File contents are read client-side and immediately rendered as formatted markdown. The drop zone is the same text area — no separate upload page. |
| **Type** | Same text area. Just start typing markdown. |

All three modes converge on the same state: markdown text in the editor + live preview. One **"Publish"** button saves the note and produces a shareable link.

**Fields on creation:**
- Title (auto-derived from first `# heading` or filename, editable)
- Content (the markdown)
- Tags (optional, freeform chip input — pick from existing tags or create new ones)
- Author (set automatically from Google profile)
- Created timestamp

### 2. Shareable link

After publishing, the user sees a clean share dialog:
- The link (e.g. `mdrop.app/n/abc123`)
- A **"Copy link"** button (one click, copies to clipboard, visual confirmation)

That's it. No embed codes, no permission dialogs, no expiry settings. Just a link.

### 3. Read view

When someone opens a shared link:
- Full-width, beautifully rendered markdown. Clean typography, good code block highlighting, nothing else.
- Small, unobtrusive header: note title, author name + avatar, creation date.
- No login wall. No banner. No popups.

### 4. Dashboard

Visible after login. Intentionally minimal:

| Element | Purpose |
|---------|---------|
| **"New note" button** | Primary action, prominent placement. |
| **Note list** | Flat list (no folders in v1). Each row: title, tags, author avatar + name, created date, copy-link icon. |
| **Tag filter** | Clickable tag chips above the list. Select a tag to filter notes; select again to deselect. Multiple tags narrow the results (AND logic). |
| **Search / filter** | Simple text filter over titles. No advanced search in v1. |

No sidebar. No categories. No settings page. Just the list, tags, and a way to create.

### 5. Edit & delete

- Author can edit their own notes (same editor interface as creation).
- Author can delete their own notes.
- No version history in v1.

### 6. Tags

Lightweight categorisation without the overhead of folders.

| Aspect | Detail |
|--------|--------|
| **Creation** | Freeform chip input on the note editor. Type to search existing tags or create a new one on the fly. |
| **Display** | Small coloured chips shown on the note row in the dashboard and in the read-view header. |
| **Filtering** | Dashboard exposes a tag bar. Click one or more tags to filter the note list (AND logic). |
| **Limits** | Max 5 tags per note. Tag names are lowercase, alphanumeric + hyphens, max 30 chars. |

### 7. Comments (minimal)

A lightweight discussion layer — intentionally bare-bones to keep the read view clean.

| Aspect | Detail |
|--------|--------|
| **Visibility** | Collapsed by default at the bottom of the read view. A small "N comments" link expands the section. |
| **Adding** | Auth required (any Google-authenticated user). Single plain-text input + "Post" button. |
| **Display** | Flat list, chronological. Each comment: author avatar + name, timestamp, plain text body. |
| **No threading** | No replies, no nesting, no reactions, no editing, no markdown in comments. |
| **Deletion** | Comment author or note author can delete a comment. |

---

## Non-features (intentionally excluded from v1)

| Excluded | Reason |
|----------|--------|
| Folders / organisation | Adds complexity. Tags cover lightweight categorisation. Revisit when note count becomes a problem. |
| Collaborative editing | Real-time collab (CRDTs/OT) is a large engineering lift. Revisit as "last-write-wins multi-author editing" in v2. |
| Custom domains | Unnecessary for v1 internal use. |
| Export | You already have the markdown — paste it somewhere else. |
| Rich text / WYSIWYG | Markdown-native. The audience knows markdown. |
| ~~Org-only (auth-gated) notes~~ | ~~Per-note visibility toggle.~~ Shipped — notes have a public/private visibility toggle. |
| Dark mode toggle | Ship one well-designed theme. (Pick whichever suits the team — can revisit.) |

---

## Technical Direction

### Stack (lightweight-first)

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js (App Router) + Tailwind CSS | Fast SSR for read views (good for shared links), minimal styling overhead. |
| **Backend / DB** | Supabase (Postgres) | Managed Postgres, built-in auth, Row Level Security, `pgvector` extension available for future semantic search. One platform for DB + auth + edge functions. |
| **Auth** | Supabase Auth with Google OAuth provider | Open to any Google account. Handles session persistence out of the box. |
| **Markdown rendering** | `react-markdown` + `remark-gfm` + `rehype-highlight` | Client + server rendering, GFM support, syntax highlighting. |
| **Hosting** | Vercel | Zero-config deployment, edge functions, free tier covers early usage. |
| **File storage** | None — markdown is stored as text in the DB | No blob storage needed. |

### Data model (v1)

```
users
├── id           TEXT      (PK, matches auth.users.id)
├── email        TEXT      (unique)
├── name         TEXT
├── image        TEXT      (Google avatar URL)
├── created_at   TIMESTAMPTZ
├── updated_at   TIMESTAMPTZ

notes
├── id           TEXT      (nanoid, used in share URL)
├── title        TEXT
├── content      TEXT      (raw markdown)
├── author_id    TEXT      (FK → users.id)
├── author_name  TEXT      (denormalized)
├── author_image TEXT      (denormalized)
├── visibility   TEXT      ('public' | 'private', default 'public')
├── created_at   TIMESTAMPTZ
├── updated_at   TIMESTAMPTZ

tags
├── id           UUID      (PK)
├── name         TEXT      (unique, lowercase, max 30 chars)
├── created_at   TIMESTAMPTZ

note_tags
├── note_id      TEXT      (FK → notes.id)
├── tag_id       UUID      (FK → tags.id)
├── PRIMARY KEY  (note_id, tag_id)

comments
├── id           UUID      (PK)
├── note_id      TEXT      (FK → notes.id)
├── author_id    TEXT      (Google user ID)
├── author_name  TEXT
├── author_image TEXT
├── content      TEXT      (plain text, no markdown)
├── created_at   TIMESTAMPTZ
```

Five tables. Users + notes + tags (many-to-many via `note_tags`) + flat comments.

### URL structure

| Route | Purpose |
|-------|---------|
| `/` | Landing / dashboard (if logged in) |
| `/new` | Create note |
| `/n/[id]` | Public read view |
| `/n/[id]/edit` | Edit note (author only) |

---

## UX Flow

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Google      │────▶│  Dashboard       │────▶│  /new        │
│  Sign-in     │     │  (note list)     │     │  paste/drop/ │
└─────────────┘     └──────────────────┘     │  type MD     │
                                              └──────┬───────┘
                                                     │ Publish
                                              ┌──────▼───────┐
                                              │  Share dialog │
                                              │  [Copy link]  │
                                              └──────┬───────┘
                                                     │ Link shared
                                              ┌──────▼───────┐
                                              │  /n/abc123   │
                                              │  (read view) │
                                              └──────────────┘
```

---

## Success Criteria

1. Time from login to shared link: **< 30 seconds**.
2. Shared link loads fully rendered markdown in **< 1 second** (SSR).
3. Zero login prompts when clicking a shared link.
4. The entire UI fits comfortably on a single screen at each step — no scrolling to find actions.

---

## Future (v2+)

- Semantic search via embeddings (`pgvector` on Supabase) — generate embeddings on publish/edit, enable similarity search across note content
- Org-only notes — per-note toggle to restrict viewing to authenticated `@pockla.com` users (leverages Supabase RLS)
- Last-write-wins multi-author editing — allow any org member to edit any note (no real-time collab, just concurrent access with last-write-wins)
- Folders / nested organisation
- Workspace / team concept (group notes by org)
- Pinned / starred notes
- Custom slugs for URLs (`mdrop.app/n/my-api-docs`)
- Markdown templates
- Comment threading & reactions
- API for programmatic note creation (CI/CD docs, changelogs)
