# Slash Command Formatting Implementation Plan

## Goal

Add a Notion-style slash command in the editor so typing `/` opens a formatting dropdown, and selecting a command inserts markdown syntax at the cursor.

## Current Product Guardrails

This feature is currently **not implementation-ready** under project docs without a product decision update:

- `docs/conventions.md` Feature Gate #1 requires explicit PRD support for v1 features.
- `docs/design-philosophy.md` editor guidance says no toolbar and suggests keyboard-only formatting discoverable via `Cmd+/`.
- Slash dropdown introduces a new interaction model (Feature Gate #3 risk) and may add friction to the 30-second publish path (Feature Gate #4 risk).

## Decision Required Before Build

Choose one path:

1. **Docs-aligned path (recommended):**
   - Implement a keyboard-first formatting palette on `Cmd+/`.
   - Defer slash dropdown until PRD/conventions explicitly allow it.

2. **Slash-command path:**
   - Update `docs/PRD.md` and `docs/conventions.md` to explicitly allow slash formatting in editor v1.x.
   - Then implement the feature below.

## Proposed Scope (If Slash Path Is Approved)

### User flow

1. User types `/` in editor textarea.
2. Command menu appears near caret with markdown format options.
3. Typing after `/` filters commands.
4. User selects with click or keyboard (`ArrowUp/ArrowDown/Enter`).
5. Slash trigger text is replaced with markdown syntax.

### Commands list

- Heading 1, Heading 2, Heading 3
- Bold, Italic, Strikethrough, Inline code
- Code block, Blockquote, Horizontal rule
- Bullet list, Numbered list, Task list
- Link, Image
- Table template

## Implementation Steps

1. Add command definitions:
   - Create `src/components/editor/slash-commands.ts`.
   - Store command id, label, keywords, category, insertion template.

2. Add insertion helpers:
   - Update `src/lib/markdown.ts` with textarea insertion helpers:
     - replace slash query range with markdown template
     - support cursor placement and placeholder selection

3. Build menu UI component:
   - Create `src/components/editor/slash-command-menu.tsx`.
   - Use existing UI primitives (`popover`/`dropdown` pattern) and keyboard navigation.
   - Keep visuals secondary/minimal to match editor style.

4. Integrate in editor:
   - Update `src/components/editor/markdown-editor.tsx`.
   - Add `onKeyDown` and slash session state (`isOpen`, `query`, `activeIndex`, range start/end).
   - Add command selection handling and menu dismissal.

5. Positioning strategy:
   - Start with robust textarea caret anchoring (preferred utility approach) or conservative fallback anchoring.
   - Ensure correct behavior with textarea scroll.

6. Accessibility and interaction pass:
   - Visible focus state for menu items.
   - Full keyboard flow (open, navigate, select, escape).
   - Click-outside dismissal and touch support.

7. Regression and UX validation:
   - Verify no impact to autosave, drag-drop markdown, and edit/preview toggle.
   - Confirm no behavior changes in read view (`/n/[id]`).

## Validation Checklist

- Typing `/` opens menu only in intended contexts.
- Query filtering works (`/hea` => heading commands).
- Enter inserts correct syntax and removes slash query.
- Escape closes menu without content mutation.
- Selection placeholders are highlighted for immediate overwrite where appropriate.
- Menu remains keyboard- and screen-reader-friendly.
- No new primary action added to editor UI.
- No read-view performance regression.

## Risks and Mitigations

- **Doc misalignment risk:** gate implementation behind PRD/conventions update.
- **Undo stack behavior:** test insertion approach to preserve expected undo/redo.
- **Caret positioning complexity:** isolate in helper and test with multiline + scrolled content.
- **Feature creep risk:** keep command set small and markdown-native.

## Estimated Effort

- Build: medium (3-4 files changed/added, ~300-500 LOC)
- QA/polish: small-medium (keyboard + caret edge cases)

## Suggested Rollout

1. Ship `Cmd+/` formatting palette first (fully aligned with current docs).
2. Collect usage feedback.
3. If still needed, enable slash command behind explicit product approval and docs update.
