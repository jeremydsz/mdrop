# Download Button Implementation Plan

## Goal

Add a consistent `Download` action that exports note content as a `.md` file in:

- List view
- Editor view
- Read/view page

The action should stay secondary (not primary), follow existing button conventions, and avoid duplicate logic.

## Approach

Implement a shared download utility plus a reusable `DownloadNoteButton` component, then integrate it into all three surfaces.

## Implementation Steps

1. Create shared download utility:
   - Add `src/lib/note-download.ts`.
   - Implement:
     - `sanitizeFilename(title: string): string`
     - `buildMarkdownFilename(title?: string): string`
     - `downloadMarkdownNote(content: string, title?: string): void`
   - Behavior:
     - Fallback filename: `untitled-note.md`
     - Use browser `Blob` + temporary object URL + cleanup (`URL.revokeObjectURL`).

2. Create reusable download button component:
   - Add `src/components/download-note-button.tsx`.
   - Mirror existing shared action patterns (similar to `CopyLinkButton`).
   - Expected props:
     - `content: string`
     - `title?: string`
     - `iconOnly?: boolean`
     - optional sizing/class props to match existing `Button` usage.
   - Accessibility:
     - Add `aria-label` for icon-only mode
     - Keep keyboard focus behavior consistent.

3. Integrate into list view:
   - Update `src/components/note-list.tsx`.
   - Add download action in each note row action cluster.
   - Preserve row-link click behavior:
     - Call `preventDefault()` and `stopPropagation()` on the action click so download does not open the note.

4. Integrate into editor:
   - Update `src/components/editor/markdown-editor.tsx`.
   - Add download action in the header-right action group.
   - Pass live editor state (`content`, title/display title) so downloads include unsaved edits.

5. Integrate into viewing page:
   - Update `src/app/n/[id]/page.tsx`.
   - Add download action in the existing action cluster near copy/edit.
   - Use loaded note content/title for download.

6. UX consistency pass:
   - Keep action styling secondary/ghost across all contexts.
   - Use consistent icon/label language (`Download` or `Download note`).
   - Avoid toast notifications unless already established for this action style.

## Validation Checklist

- List row download triggers file download and does not navigate.
- Editor download includes latest in-memory content (including unsaved changes).
- Read page download uses note content correctly.
- Empty or missing titles use `untitled-note.md`.
- Filenames are sanitized for common filesystem-invalid characters.
- Keyboard navigation and focus indicators remain correct.
- No regressions to copy/delete/edit actions.

## Optional Follow-ups

- Add unit tests for filename sanitization and fallback naming.
- Add an integration test for list row click isolation.
- Add lightweight analytics/event tracking for download usage if needed.
