# mdrop — The Guide

**Paste markdown. Get a link. Share it.**

mdrop turns raw markdown into a clean, readable page with a shareable URL — no wikis, no repos, no friction. If you can write a message, you can use mdrop.

---

## 30-Second Quick Start

1. **Sign in** at [mdrop](/) with your Google account.
2. **Click "New note"** on the dashboard.
3. **Write, paste, or drop** a `.md` file into the editor.
4. **Hit publish**, then **copy the link**.
5. Send that link to anyone — they can read it without signing in.

That's it. Everything below makes you faster.

---

## What You're Looking At

mdrop has four screens. That's by design.

| Screen | URL | What it does |
|---|---|---|
| **Dashboard** | `/` | Your notes, search, tag filters, new note button |
| **Editor** | `/new` or `/n/[id]/edit` | Split-pane writing with live preview |
| **Read view** | `/n/[id]` | The shareable page your audience sees |
| **Login** | `/login` | Google sign-in (one click) |

No settings page. No profile page. No admin panel. You write, you share, you move on.

---

## Creating Notes

### Three ways in

- **Type** — Start writing directly in the editor.
- **Paste** — Copy markdown from anywhere and paste it in. The title auto-populates from your first `# heading`.
- **Drag and drop** — Drop a `.md` file onto the dashboard or the editor. The file contents and filename are read instantly.

### The editor

The editor is a split pane: **edit on the left, preview on the right**. On smaller screens, you toggle between them.

What you see in the preview is exactly what your readers see in the read view — same rendering, same styling.

**Keyboard shortcut:** Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) to jump straight to the read view.

### Autosave

Once a note is published, every edit is **autosaved** after ~1.2 seconds of inactivity. No save button. No "unsaved changes" warning. Just type and trust it.

---

## Slash Commands — The Formatting Menu

Type `/` anywhere in the editor to open the **slash command menu**. This is the fastest way to format without memorizing markdown syntax.

Keep typing after `/` to filter. For example, `/hea` narrows to heading options.

Navigate with **arrow keys**, confirm with **Enter**.

### Available commands

| Command | What it inserts |
|---|---|
| **Heading 1–3** | `#`, `##`, `###` |
| **Bold** | `**text**` |
| **Italic** | `*text*` |
| **Strikethrough** | `~~text~~` |
| **Inline code** | `` `code` `` |
| **Code block** | Fenced code block with language |
| **Blockquote** | `> quote` |
| **Horizontal rule** | `---` |
| **Bullet list** | `- item` |
| **Numbered list** | `1. item` |
| **Task list** | `- [ ] task` |
| **Link** | `[text](url)` |
| **Image** | `![alt](url)` |
| **Table** | Markdown table scaffold |

The menu positions itself near your cursor and stays in view even when you scroll.

---

## Markdown Support

mdrop renders GitHub-Flavored Markdown (GFM). Here's what works:

- **Headings** (`#` through `######`)
- **Bold**, *italic*, ~~strikethrough~~
- Inline `code` and fenced code blocks with **syntax highlighting**
- Blockquotes
- Ordered and unordered lists
- Task lists (`- [x] done`, `- [ ] todo`)
- Tables
- Horizontal rules
- Links and autolinks
- Images (must use `https://` URLs)

Code blocks get automatic syntax highlighting — just specify the language after the opening fence:

````
```python
def greet(name):
    return f"Hello, {name}"
```
````

---

## Tags

Tags help you organize notes and help others find them.

### Adding tags

In the editor, use the tag input below the title. You can:

- Type a tag name and press Enter to add it
- Search existing tags as you type (suggestions appear)
- Create new tags on the fly

### Rules

- Up to **5 tags** per note
- Lowercase letters, numbers, and hyphens only
- Max 30 characters per tag

### Filtering

On the dashboard, click tags to filter your note list. Selecting multiple tags uses **AND** logic — only notes with *all* selected tags are shown.

Tags are also visible on note cards and in the read view header.

---

## Visibility

Every note is either **public** or **private**.

- **Public** (default) — Anyone with the link can read it. No login required.
- **Private** — Only you can see it. Others get a 404.

Toggle visibility in the editor using the **Public/Private** button next to the tag input. Changes autosave like everything else.

---

## Sharing

### How it works

Every published note gets a unique URL like `/n/aBcDeFgHiJ`. Public notes can be read by anyone with the link — **no login required**. Private notes return a 404 for anyone except the author.

### Copying the link

You can copy a note's link from three places:

- **Dashboard** — Click the copy icon on any note row
- **Editor** — Use the copy link action after publishing
- **Read view** — Copy link button in the note header

After copying, you'll see a brief "Copied" confirmation with a checkmark.

### What readers see

Readers get a clean, typography-focused page with:

- The note title
- Author name and avatar
- Published and updated timestamps
- Tags
- The rendered markdown content
- Comments (if any)

No sidebar. No navigation clutter. Just the content.

---

## Comments

### Reading

Comments appear at the bottom of the read view, collapsed by default. Click **"N comments"** to expand.

### Writing

You must be signed in with a Google account to comment. The comment composer supports inline formatting:

- **Bold** and *italic*
- Lists and blockquotes
- Inline code and links

A live preview shows how your comment will look before you post it.

### Deleting

The **comment author** or the **note author** can delete any comment. No editing — delete and rewrite if needed.

Comments are a flat list (no threading).

---

## Downloading Notes

You can download any note as a `.md` file from three places:

- **Dashboard** — Download action on the note row
- **Editor** — Download button
- **Read view** — Download button in the note header

The filename comes from the note title (e.g., `my-note-title.md`). Untitled notes download as `untitled-note.md`.

---

## Editing and Deleting

### Editing

Only the original author can edit a note. Navigate to the note and click **Edit**, or go directly to `/n/[id]/edit`.

Edits autosave. The "updated at" timestamp refreshes automatically.

### Deleting

Only the original author can delete a note. This is permanent — there's no trash or undo. The shared link stops working immediately.

---

## Dashboard

The dashboard is your home screen after signing in. It shows:

- **New note** button (top of the page)
- **Search** — Filter notes by title or content
- **Tag filter** — Click tags to narrow results
- **Note list** — All your notes with title, tags, date, and quick actions (copy link, download, delete)

You can also **drag and drop** `.md` files directly onto the dashboard to create notes from them.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Enter` | Open read view from editor |
| `/` | Open slash command menu |
| `Arrow keys + Enter` | Navigate and select slash commands |
| `Esc` | Close slash command menu |

---

## Tips for Power Users

- **Title trick** — Start your note with a `# Heading` and it becomes the note title automatically. No separate title field needed.
- **Fast sharing** — Write → Publish → Copy link. Three actions, under 10 seconds.
- **Drop multiple files** — Drag `.md` files onto the dashboard to batch-create notes.
- **Tag strategy** — Use consistent tags across your team (e.g., `rfc`, `standup`, `retro`) so everyone can filter to what matters.
- **Link in Slack** — Paste an mdrop link in Slack and recipients can read it instantly, no sign-in prompt.

---

## What mdrop Doesn't Do (On Purpose)

- **No folders** — Use tags instead. Flat is fast.
- **No real-time collaboration** — One author per note. Share the link, not the editor.
- **No version history** — Keep it simple. If you need version control, use Git.
- **No file uploads** — Images must be hosted elsewhere (`https://` URLs only).
- **No granular permissions** — Notes are either public (anyone with the link) or private (author only).

These aren't missing features. They're design decisions to keep mdrop fast and focused.

---

## Requirements

- A Google account (for writing and commenting)
- A modern browser (Chrome, Firefox, Safari, Edge)
- That's it

---

*mdrop is built for people who think in markdown and share in links.*
