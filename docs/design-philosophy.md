# MDrop — Design Philosophy

## The Ethos

MDrop follows the discipline of **subtractive design**: every pixel, every animation, every element must justify its existence. If something can be removed without degrading the experience, it must be removed. What remains should feel inevitable — as though it could not have been designed any other way.

This is the philosophy Apple held in its finest era: the conviction that restraint is a feature, that whitespace communicates confidence, and that beauty is not decoration but the natural result of rigorous clarity.

MDrop is a tool for *reading*. The interface should disappear the moment content appears.

---

## Core Principles

### 1. Content is the interface

The rendered markdown **is** the product. Every UI element exists in service of the content, never in competition with it. Chrome, toolbars, and navigation should feel like quiet scaffolding — present when needed, invisible when not.

### 2. Silence over noise

Prefer absence. No gratuitous borders, no drop shadows for decoration, no colour where grey will do. A blank area is not wasted space — it is breathing room that makes adjacent elements more legible and more important.

### 3. One obvious path

At any given moment, the user should see exactly one primary action. The hierarchy of the screen should make the next step self-evident. If the user needs to think about where to click, the design has failed.

### 4. Motion with purpose

Animation is not ornamentation. Every transition communicates spatial relationship, confirms an action, or eases a state change. Motion should feel physical — governed by spring physics, not linear easing — and should never delay the user.

### 5. Typography as architecture

Type does the heavy lifting. Size, weight, and spacing create hierarchy without resorting to boxes, lines, or colour shifts. A well-set page needs almost nothing else.

### 6. Consistency is a product feature

Visual consistency is not polish; it is usability. Equivalent controls must look and behave the same across the entire app (dashboard, editor, read view, dialogs, auth flows). If two elements are both "fields", they share one field language for border, radius, background, focus state, and placeholder treatment.

---

## Design System & Technology Choices

### Component Foundation

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Primitives** | **Radix UI** | Unstyled, accessible headless components. Handles focus management, ARIA roles, keyboard navigation, and composability. Gives us total control over visual output while guaranteeing accessibility. |
| **Styled Components** | **shadcn/ui** (selectively) | Copy-paste component library built on Radix + Tailwind. Components live in our codebase — no vendor lock-in, full ownership. We cherry-pick only what we need and restyle aggressively to match our design language. We do not use shadcn defaults as-is. |
| **Styling** | **Tailwind CSS v4** | Utility-first CSS with design tokens expressed as CSS variables via `@theme`. Zero abstraction overhead, co-located styles, no naming debates. |
| **Animation** | **Motion** (Framer Motion) | Declarative React animation with spring physics, layout animations, gesture support (`whileHover`, `whileTap`, `drag`), and `AnimatePresence` for mount/unmount transitions. The API favours tasteful defaults. |
| **Icons** | **Lucide React** | Stroke-based, minimal icon set. Tree-shakeable, ~1KB per icon. Consistent 24×24 grid with 1.5px stroke — clean and legible at small sizes without visual noise. |

### Why This Stack

The stack is deliberately **layered from unstyled to styled**:

```
Radix (behaviour + a11y)
  → shadcn/ui (starting templates)
    → Our overrides (MDrop design language)
      → Tailwind (utility application)
        → Motion (transition layer)
```

This means we never fight a library's opinions. Radix gives us correct behaviour. shadcn gives us a starting point. We own the final aesthetic.

---

## Design Tokens

### Typography

MDrop uses the **Geist type family** — Sans for all UI and prose, Mono for code. One family, two variants, multiple weights. Restraint in font choice forces discipline in hierarchy — we differentiate through scale and weight, not typeface variety.

| Role | Font | Weight | Size | Tracking |
|------|------|--------|------|----------|
| **Display** | Geist Sans | 600 (Semi) | 2rem (32px) | -0.025em |
| **Title** | Geist Sans | 600 (Semi) | 1.5rem (24px) | -0.02em |
| **Heading** | Geist Sans | 500 (Medium) | 1.125rem (18px) | -0.015em |
| **Body** | Geist Sans | 400 (Regular) | 0.9375rem (15px) | -0.01em |
| **Caption** | Geist Sans | 400 (Regular) | 0.8125rem (13px) | 0 |
| **Mono (code)** | Geist Mono | 400 (Regular) | 0.875rem (14px) | 0 |

**Why Geist.** Built by Vercel specifically for developer tools and modern interfaces, rooted in Swiss design principles — precision, clarity, functionality. As a variable font, it supports continuous weight tuning across the full 100–900 range. Its geometric construction gives headings a sharp, intentional feel, while its generous x-height keeps body text legible at small sizes. Geist Mono is its natural companion for code blocks, sharing the same design DNA so prose and code feel like one coherent system. Installed via `next/font` for zero-layout-shift loading with full glyph and `font-feature-settings` support.

**Why negative tracking at larger sizes.** Large text with default letter-spacing looks loose and unpolished. Tightening tracking at display/title sizes creates the dense, confident typographic feel of high-end print design.

### Colour

The palette is deliberately **monochromatic with a single accent**. Colour is scarce, which makes it powerful when it appears.

#### Semantic Palette

| Token | Light Mode | Purpose |
|-------|-----------|---------|
| `--surface` | `white` | Page background |
| `--surface-raised` | `zinc-50` (#fafafa) | Cards, elevated containers |
| `--surface-sunken` | `zinc-100` (#f4f4f5) | Input fields, code blocks |
| `--border` | `zinc-200` (#e4e4e7) | Subtle dividers, input borders |
| `--border-strong` | `zinc-300` (#d4d4d8) | Active/focused borders |
| `--text-primary` | `zinc-950` (#09090b) | Headings, primary content |
| `--text-secondary` | `zinc-500` (#71717a) | Captions, metadata, timestamps |
| `--text-tertiary` | `zinc-400` (#a1a1aa) | Placeholder text, disabled states |
| `--accent` | `blue-600` (#2563eb) | Links, primary buttons, focus rings |
| `--accent-hover` | `blue-700` (#1d4ed8) | Hover state for accent elements |
| `--accent-subtle` | `blue-50` (#eff6ff) | Accent backgrounds (tags, badges) |
| `--destructive` | `red-600` (#dc2626) | Delete actions only |

**Why zinc over gray.** Zinc is Tailwind's most chromatic-neutral grey — no blue or warm tint. This purity lets the single accent colour (blue) carry all the warmth and personality without competing with tinted neutrals.

**Why a single accent colour.** Multiple accent colours fragment attention. One colour means: anything blue is interactive or important. The user learns this in seconds and never has to decode a colour system.

### Spacing

An **8px base grid** with a constrained set of named tokens. We use Tailwind's spacing scale but restrict ourselves to a disciplined subset.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Inline gaps, icon padding |
| `space-2` | 8px | Tight element spacing |
| `space-3` | 12px | Compact groups |
| `space-4` | 16px | Standard gap between related elements |
| `space-6` | 24px | Section sub-divisions |
| `space-8` | 32px | Major section separation |
| `space-12` | 48px | Page-level vertical rhythm |
| `space-16` | 64px | Top-level page padding |

**Rule:** If a spacing value is not in this table, it should not appear in the codebase. Arbitrary values break visual rhythm.

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Chips, tags, small badges |
| `radius-md` | 10px | Buttons, inputs, cards |
| `radius-lg` | 16px | Modals, popovers, large containers |
| `radius-full` | 9999px | Avatars, pills |

Corners are generous but not cartoonish. The `10px` default radius for interactive elements echoes the rounded-rect language of macOS/iOS without mimicking it literally.

### Shadows

Shadows are used **sparingly** — only to establish layering, never for decoration.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle lift for cards |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.06)` | Popovers, dropdowns |
| `shadow-lg` | `0 12px 40px rgba(0,0,0,0.08)` | Modals, share dialogs |
| `shadow-focus` | `0 0 0 2px var(--accent)` | Focus ring (keyboard nav) |

Low-opacity, large-blur shadows feel like natural light rather than Photoshop effects.

---

## Motion Language

### Spring Configuration

All animations use **spring physics**, not duration-based easing. Springs feel natural because they model real-world inertia.

| Preset | Config | Usage |
|--------|--------|-------|
| `snappy` | `{ stiffness: 500, damping: 30 }` | Micro-interactions: button press, toggle flip |
| `smooth` | `{ stiffness: 300, damping: 25 }` | Standard transitions: panel open, card hover |
| `gentle` | `{ stiffness: 200, damping: 20 }` | Large movements: modal entrance, page transitions |

### Rules

1. **No animation exceeds 400ms perceived duration.** If it feels slow, it is slow.
2. **Exit animations are faster than entrances.** Users closing something want it gone immediately.
3. **Layout animations use `layout` prop** from Motion to interpolate smoothly between states without FLIP hacks.
4. **Scroll-linked effects are forbidden.** No parallax, no scroll-triggered fades. Content appears; the user scrolls. That's it.
5. **Reduced motion is respected.** Wrap all animation in `prefers-reduced-motion` checks. When reduced motion is active, transitions resolve instantly.

---

## Component-Level Decisions

### Buttons

- **Primary:** Solid `accent` fill, white text, `radius-md`. Subtle scale-down on press (`scale: 0.98`). One per screen maximum.
- **Secondary:** Transparent background, `border` stroke, `text-primary`. Hover fills `surface-raised`.
- **Ghost:** No border, no background. Text only. Used for tertiary actions and navigation.
- **Destructive:** Red outline, ghost style. Only appears after an explicit "delete" intent (never as a default visible action).

No gradients. No icons-only without labels (except universally understood symbols like ×). No disabled buttons that look clickable.

### Inputs

- Clean `surface-sunken` background with `border` stroke.
- On focus: background transitions to `white`, border transitions to `accent`, and the focus ring (`shadow-focus`) appears.
- Labels sit above the input, never float or animate into the field.
- Placeholder text is `text-tertiary` and provides example content, not instructions.
- **Consistency mandate:** all field-like controls (search bars, text inputs, textareas, tag entry shells, read-only link fields, editor text boxes) must use the same shared field tokens/classes. No one-off border/focus styles are allowed.
- **Implementation rule:** field visuals must be defined in one reusable source of truth (component primitive or shared class module) and consumed everywhere; do not duplicate field styling strings inline.
- **PR check:** any new or changed field must be compared against existing field components before merge.

### Cards (Note List Items)

- Minimal: no visible card border at rest. Content alone creates the boundary.
- On hover: `surface-raised` background fades in, lifting the row off the page.
- Information hierarchy within each row: **Title** (bold, `text-primary`) → **Tags** (small chips, `accent-subtle`) → **Author + date** (caption, `text-secondary`) → **Copy link** (ghost icon, far right).

### Tags

- Small rounded chips (`radius-sm`, `accent-subtle` background, `accent` text).
- No close button in read contexts. Close button appears only in the editor.
- Max 5 per note enforced at the input level, not with error messages.

### Modals / Dialogs

- Centered, max-width 480px. `radius-lg`, `shadow-lg`.
- Backdrop: `rgba(0,0,0,0.4)` with backdrop-blur `8px`.
- Entrance: fade + subtle scale from `0.96` to `1.0` with `gentle` spring.
- Always dismissible via Escape key and backdrop click.

---

## View-Specific Guidelines

### Read View (`/n/[id]`)

This is the most important screen. It is what 90% of users will see (readers clicking a shared link).

- **Content column:** max-width `680px`, centred. This width ensures optimal line length (65-75 characters per line) for sustained reading.
- **Header:** Note title in `Display` type. Author avatar (32px, `radius-full`) + name + date in `Caption` below. One `border` divider below, then content.
- **No navigation chrome.** No sidebar, no breadcrumbs, no "back to dashboard" link. The page is the content.
- **Code blocks:** `surface-sunken` background, `mono` font, syntax highlighting using muted colours that don't overpower the prose.
- **Comments section:** Collapsed by default. A small "N comments" link at the bottom. When expanded, comments slide in with `smooth` spring. Each comment is separated by `border`, not card-wrapped.

### Editor (`/new`, `/n/[id]/edit`)

- **Split pane:** Editor left, preview right. On screens < 1024px, toggle between edit and preview.
- **Editor pane:** Monospaced font, `surface-sunken` background, minimal chrome. Line numbers off by default.
- **Preview pane:** Identical rendering to the read view. What you see in preview is exactly what readers will see.
- **Toolbar:** None. Markdown is the interface. If we later add formatting shortcuts, they'll be keyboard-only with a discoverable shortcut palette (Cmd+/).

### Dashboard (`/`)

- **Top bar:** MDrop wordmark (left), user avatar (right). Nothing else.
- **"New note" button:** Primary button, top of the content area. Prominent but not oversized.
- **Tag filter bar:** Horizontal scroll of tag chips above the note list. Selected tags fill with `accent`, unselected tags use `surface-raised`.
- **Note list:** Flat, unbounded list. No pagination in v1 — virtualize if the list grows.
- **Search:** A single text input above the list with a search icon. No "advanced search" link, no filters dropdown.
- **Empty state:** Centre-aligned illustration-free message: "No notes yet. Create your first one." with a primary button. No whimsical illustrations — they age poorly and clash with the minimal aesthetic.

### Share Dialog

- Small modal. The link in a read-only input. One "Copy link" button (primary).
- On copy: button text transitions to "Copied" with a subtle checkmark icon swap. Reverts after 2 seconds.
- No other options. No "share to Slack" button. No QR code. The clipboard is the universal share mechanism.

---

## What We Deliberately Avoid

| Pattern | Why it's excluded |
|---------|-------------------|
| Glassmorphism / blur effects on UI elements | Visually trendy but reduces readability and feels performative rather than functional |
| Skeleton loaders everywhere | SSR means content loads fast. A brief blank is preferable to a flickering skeleton that draws attention to loading rather than content |
| Toast notifications | Disruptive and often missed. Inline confirmation (e.g. "Copied" on the button itself) is more reliable and quieter |
| Dark mode (v1) | One theme, done well. A half-considered dark mode is worse than none. Ship light, revisit later with equal rigour |
| Custom scrollbars | Platform scrollbars are familiar and accessible. Custom scrollbars break expectations and often fail on touch devices |
| Hover-only affordances | Every interactive element must be visually identifiable without hovering. Hover enhances; it never reveals |
| Icon-only buttons without labels | Ambiguous. The only exceptions: close (×), copy (clipboard icon in context), and avatar (universally understood) |

---

## Summary

The MDrop interface should feel like a well-edited essay: every word earns its place, the structure is invisible until you look for it, and the reader's attention flows naturally from start to finish. We achieve this not by adding polish, but by removing everything that isn't essential — and then making what remains beautiful through typography, spacing, and restraint.
