# Dark Mode Implementation Plan

## Goal

Introduce dark mode with minimal product and technical risk, while preserving MDrop's core principles:

- zero-friction usage
- restrained UI
- read-first performance
- no settings-heavy complexity

## Constraint Check (from current docs)

Dark mode currently conflicts with existing product guardrails:

- `docs/design-philosophy.md` lists dark mode as intentionally excluded in v1.
- `docs/PRD.md` lists "Dark mode toggle" as a non-feature in v1.
- `docs/conventions.md` has a non-negotiable: no settings page and no theme toggles.

Because of this, the safest route is to add **automatic system dark mode** (OS-driven), not a manual toggle.

---

## Recommended Route (Route A)

### Route A: System-Driven Dark Mode (Recommended)

Use `prefers-color-scheme` to switch semantic CSS tokens between light and dark automatically.

Why this is the best fit:

1. No new user-facing control surface (aligns with "no settings page" and minimal UI).
2. No extra client state/provider required.
3. Read view remains server-first and lightweight.
4. Existing semantic token architecture in `src/app/globals.css` already supports this pattern.

### Route B: Manual Theme Toggle (Not recommended for now)

Would require:

- explicit product-doc changes (PRD/conventions/design philosophy)
- theme persistence strategy
- additional client-side UI/state complexity

Keep this as a v2 option only if user research shows clear demand for manual override.

---

## Implementation Steps (Route A)

### Step 0: Product/Docs Alignment (required first)

Before code changes, align docs so implementation is intentional:

- Update `docs/design-philosophy.md` from "dark mode excluded" to:
  - "dark mode supported via system preference; no in-app toggle in v1.x"
- Update `docs/PRD.md` non-feature wording similarly.
- Keep `docs/conventions.md` non-negotiable intact for no settings/toggle.

### Step 1: Add Dark Token Set in Global CSS

File: `src/app/globals.css`

Add a dark token map using media query:

- `@media (prefers-color-scheme: dark) { :root { ... } }`

Define dark values for all existing semantic tokens:

- `--surface`
- `--surface-raised`
- `--surface-sunken`
- `--border`
- `--border-strong`
- `--text-primary`
- `--text-secondary`
- `--text-tertiary`
- `--accent`
- `--accent-hover`
- `--accent-subtle`
- `--destructive`

Keep token names unchanged so components do not need API-level changes.

### Step 2: Let Browser Render Native Controls Correctly

File: `src/app/globals.css`

Set:

- `:root { color-scheme: light dark; }`

This improves built-in control rendering consistency and avoids mismatched UA styling in dark mode.

### Step 3: Add Syntax Highlighting Theme Pair

File: `src/app/globals.css`

Current import uses only light syntax colors:

- `highlight.js/styles/github.css`

Switch to light/dark paired imports using media conditions:

- light: `github.css`
- dark: `github-dark.css` (or closest low-contrast variant consistent with MDrop style)

This is critical for readability in code blocks on read and editor preview surfaces.

### Step 4: Eliminate Hardcoded Light Colors

Audit and replace hardcoded color utilities where needed:

- `bg-white`, `text-zinc-*`, `border-zinc-*`, inline hex/rgb values

Prefer semantic token-backed classes:

- `bg-[var(--surface)]`, `text-[var(--text-primary)]`, etc.

Target files first:

- `src/components/**`
- `src/app/**`

### Step 5: Tune Component Contrast and Interaction States

Validate and adjust for dark mode:

- focus ring visibility (`--shadow-focus`)
- muted text legibility
- chip/tag contrast
- dialog backdrop and elevation balance
- destructive action distinguishability

No component behavior changes; only token/class-level visual tuning.

### Step 6: Accessibility and Performance Verification

Verify:

- keyboard focus is clearly visible in both themes
- body text and metadata contrast remain accessible
- markdown links remain clearly distinguishable
- read view remains server-rendered with no new client runtime dependency
- no measurable LCP regression on `/n/[id]`

---

## File Change Route

### Phase 1 (Foundation)

- `docs/design-philosophy.md`
- `docs/PRD.md`
- `docs/conventions.md` (small clarification only if needed)

### Phase 2 (Token + Global Styling)

- `src/app/globals.css`

### Phase 3 (Audit + Corrections)

- `src/components/**/*.tsx`
- `src/app/**/*.tsx`

### Phase 4 (Validation)

- visual QA pass across `/`, `/new`, `/n/[id]`, `/n/[id]/edit`, auth flow
- accessibility and contrast checks

---

## Validation Checklist

- Dark mode follows OS setting automatically.
- No theme toggle appears in UI.
- All four core routes render correctly in both themes.
- Code blocks and inline code are readable in dark mode.
- One-primary-action hierarchy remains intact on each screen.
- No new route, table, or settings screen introduced.
- Keyboard-only navigation remains clear with visible focus.

---

## Risks and Mitigations

- **Risk: Dark palette drifts from minimalist aesthetic**
  - Mitigation: keep monochrome neutrals + single accent model; avoid high-saturation dark UI.

- **Risk: Missed hardcoded color utilities**
  - Mitigation: run targeted audits and visual diff review route-by-route.

- **Risk: Syntax highlighting too bright or too low contrast**
  - Mitigation: pick subdued highlight theme and manually test common languages.

- **Risk: Product-scope creep into theme settings**
  - Mitigation: explicitly lock v1.x to system-only behavior.

---

## Estimated Effort

- Foundation docs alignment: small
- CSS token + syntax theme updates: small-medium
- component audit and fixes: medium
- QA pass: medium

Total: small-to-medium implementation, feasible in one focused iteration.
