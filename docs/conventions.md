# MDrop — Conventions

This document exists to protect the product from well-intentioned drift. Every convention here traces back to a principle in the PRD or design philosophy. Before adding a feature, a component, or a line of CSS, check it against these rules. If something doesn't pass, it doesn't ship.

---

## 1. The Feature Gate

Every proposed feature or UI addition must survive these five questions in order. If it fails any one of them, stop.

| # | Question | Fail condition |
|---|----------|----------------|
| 1 | **Does the PRD explicitly call for this?** | If it's not in Core Features (v1) or Technical Direction, it is a v2+ item or a non-feature. Do not build it. |
| 2 | **Can the user's goal be achieved without this?** | If yes, the feature is a convenience, not a necessity. Defer it. |
| 3 | **Does it add a new concept the user must learn?** | If it introduces a new interaction pattern, a new UI region, or a new mental model — the cost is too high for v1. |
| 4 | **Does it increase the time from landing to shared link?** | If adding this feature inserts a step, a decision, or a modal between the user and their goal, reject it. The 30-second path is sacred. |
| 5 | **Can it be removed later without breaking anything?** | If removing it would require a migration, a data model change, or user re-education, it is load-bearing. Only load-bearing things should exist in v1. |

**When in doubt, leave it out.** A feature that ships in v2 after careful thought is better than a feature that ships in v1 and must be maintained forever.

---

## 2. File & Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (font loading, providers)
│   ├── page.tsx            # Landing / dashboard
│   ├── new/
│   │   └── page.tsx        # Create note
│   └── n/
│       └── [id]/
│           ├── page.tsx    # Read view (public, SSR)
│           └── edit/
│               └── page.tsx # Edit note
├── components/
│   ├── ui/                 # Primitive UI components (from shadcn, restyled)
│   └── [feature]/          # Feature-specific compositions (e.g. note-list, editor)
├── lib/                    # Utilities, Supabase client, helpers
├── styles/                 # Global CSS, Tailwind theme overrides
└── types/                  # Shared TypeScript types
```

### Rules

- **One component per file.** Named exports matching the filename. No barrel files (`index.ts` re-exports) — they obscure import origins and slow IDE navigation.
- **Co-locate, don't scatter.** If a helper function is used by exactly one component, put it in the same file. Only promote to `lib/` when a second consumer appears.
- **No `utils` junk drawer.** Every file in `lib/` has a specific domain name: `lib/supabase.ts`, `lib/markdown.ts`, `lib/nanoid.ts`. A file called `utils.ts` or `helpers.ts` is a code smell — rename it or split it.
- **Pages are thin.** A page file (`page.tsx`) fetches data and composes components. It does not contain layout logic, styling decisions, or business rules.

---

## 3. Component Conventions

### Naming

- PascalCase for components: `NoteCard`, `TagChip`, `ShareDialog`.
- camelCase for hooks: `useNotes`, `useAuth`, `useClipboard`.
- kebab-case for files: `note-card.tsx`, `tag-chip.tsx`, `share-dialog.tsx`.
- Props interfaces are named `[Component]Props`: `NoteCardProps`, `TagChipProps`.

### Composition Rules

- **Flat over nested.** If a component has more than two levels of nesting in its JSX, break it apart. Deep nesting hides complexity.
- **Props over context for component data.** Use React context only for truly global concerns (auth state, theme). Everything else flows through props — explicit data flow is easier to trace and test.
- **No prop drilling past two levels.** If a value must traverse more than two components to reach its consumer, introduce a context or restructure the component tree.
- **No render props, no HOCs.** Hooks replaced both patterns. If you find yourself reaching for either, write a hook instead.

### shadcn/ui Usage

- Install only the components you need. Do not pre-install the full library.
- After installing a shadcn component, **immediately restyle it** to match the design tokens in `design-philosophy.md`. The shadcn defaults are a starting point, not a final state.
- If a shadcn component brings in dependencies or patterns that feel heavy for MDrop (e.g. complex compound components for a simple use case), write a simpler version from scratch using Radix primitives directly.

---

## 4. Styling Conventions

### Tailwind Usage

- **Utility classes in JSX.** Styles live on the element they affect. No separate CSS files per component.
- **Design tokens only.** Use the spacing, colour, radius, and shadow tokens defined in `design-philosophy.md`. Arbitrary values (`w-[347px]`, `mt-[13px]`) are forbidden unless they solve a genuine one-off alignment problem — and they must include a comment explaining why.
- **No `@apply`.** It creates a shadow stylesheet that's harder to trace than inline utilities. Write the classes directly.
- **Responsive breakpoints:** `sm` (640px), `md` (768px), `lg` (1024px). That's it. No `xl`, no `2xl`. MDrop is a reading tool — it works on phone, tablet, and laptop. Ultra-wide layouts are not a design target.
- **Mobile-first.** Base styles are for the smallest screen. Layer up with `sm:`, `md:`, `lg:` prefixes.

### Class Ordering

Follow a consistent order within `className` strings:

1. Layout (`flex`, `grid`, `block`, `relative`)
2. Sizing (`w-`, `h-`, `max-w-`, `min-h-`)
3. Spacing (`p-`, `m-`, `gap-`)
4. Typography (`text-`, `font-`, `leading-`, `tracking-`)
5. Colour (`bg-`, `text-`, `border-`)
6. Effects (`shadow-`, `opacity-`, `rounded-`)
7. State variants (`hover:`, `focus:`, `active:`)
8. Responsive (`sm:`, `md:`, `lg:`)

This is a guideline, not a lint rule. The point is predictability, not pedantry.

### Forbidden Patterns

| Pattern | Why |
|---------|-----|
| Inline `style` attributes | Breaks the utility-class contract. Use Tailwind or CSS variables. |
| CSS Modules | Adds a second styling paradigm. One system (Tailwind) is enough. |
| `!important` | If you need it, the specificity model is broken. Fix the root cause. |
| Conditional class strings via template literals | Use `clsx` or `cn` (from shadcn's `lib/utils`) for conditional classes. Template literals with ternaries are unreadable. |

---

## 5. Data & State Conventions

### Server vs Client

- **Default to Server Components.** Every component is a React Server Component unless it needs interactivity (event handlers, hooks, browser APIs). Mark client components explicitly with `"use client"`.
- **Fetch data on the server.** Pages and layouts call Supabase directly in server context. No `useEffect` fetches for initial page data.
- **Client state is local and small.** The only client-side state should be: form inputs, UI toggles (modal open/close, expanded/collapsed), and optimistic UI updates. If you're reaching for a global state manager, something has gone wrong.

### Supabase

- **One client instance.** `lib/supabase.ts` exports a server client and a browser client. Do not instantiate Supabase clients elsewhere.
- **Row Level Security is mandatory.** Every table has RLS policies. No table should be accessible without a policy — even if the policy is permissive (e.g. public read for notes).
- **Type your queries.** Generate types from the Supabase schema and use them in all queries. No `any` types leaking from database calls.

### Data Flow

```
Server Component (page.tsx)
  → fetches data from Supabase
  → passes data as props to child components
  → Client Components handle interactivity with local state
  → Mutations call Server Actions or Supabase client directly
  → Revalidate with Next.js cache tags / router.refresh()
```

No intermediate caching layers. No Redux. No Zustand. No SWR for data that server components can provide.

---

## 6. UI Behaviour Conventions

### One Primary Action Per Screen

Every view has exactly one primary button. Identify it and ensure nothing else competes visually.

| View | Primary Action |
|------|---------------|
| Dashboard | "New note" |
| Editor | "Publish" (create) / "Save" (edit) |
| Share Dialog | "Copy link" |
| Read View | None — the content is the experience |

If you're adding a feature and it requires a second primary button, the feature is too complex or the screen needs restructuring.

### Confirmation & Feedback

- **No toasts.** Feedback happens inline, at the point of action. "Copy link" → button text becomes "Copied" for 2 seconds. "Delete" → item disappears with exit animation. "Publish" → redirect to share dialog.
- **No success pages.** After a mutation, the user should land somewhere useful (dashboard, share dialog, read view), not on a "Success!" dead-end.
- **Destructive actions require a confirmation dialog.** Delete note, delete comment — these get a simple "Are you sure?" modal with a destructive-styled confirm button. No undo, no trash can, no recovery. Clear and final.

### Empty States

- Text-only. No illustrations, no icons, no animations.
- State what's empty and offer the one action that fixes it.
- Example: "No notes yet." + primary button "Create your first note".
- Never use: "It's lonely here!" or "Nothing to see!" or any other anthropomorphic language.

### Loading States

- SSR eliminates most loading states for initial page loads.
- For client-side mutations (publishing, deleting), disable the triggering button and show a spinner *inside* the button. Do not overlay the page with a loading indicator.
- Never use skeleton screens. A brief flash of blank content is preferable to a skeleton that calls attention to the wait.

### Error States

- Inline, near the element that failed. Form validation errors appear below the relevant input. Network errors appear as a small banner at the top of the content area — not a modal, not a toast.
- Error copy is specific and actionable: "Couldn't save. Check your connection and try again." Never: "Something went wrong."
- Errors are dismissible but not auto-dismissing. The user decides when they've read the message.

---

## 7. Copy & Language Conventions

### Voice

- **Direct, not clever.** "Copy link" not "Share the love." "Delete note" not "Remove this note from your collection."
- **Short, not truncated.** Labels and buttons should be complete words, not abbreviations. "Publish" not "Pub." "Comments" not "Cmts."
- **Lowercase in context, sentence case in UI.** Button labels, headers, and navigation items use sentence case ("New note", "Copy link"). No Title Case, no ALL CAPS except for acronyms.

### Labels

| Element | Convention | Example |
|---------|-----------|---------|
| Buttons | Verb or Verb + Noun | "Publish", "Copy link", "Delete" |
| Inputs | Noun (label above) | "Title", "Tags", "Content" |
| Empty states | Statement + action | "No notes yet." + "Create your first note" |
| Errors | Problem + solution | "Couldn't publish. Try again." |
| Timestamps | Relative when recent, absolute when old | "2 hours ago", "Mar 2, 2026" |

### Timestamps

- **Relative** for anything less than 7 days old: "just now", "5 minutes ago", "3 days ago".
- **Absolute** for anything older: "Feb 24, 2026". No time-of-day unless the context demands it (comments may show time).
- **No "ago" + absolute hybrid.** Pick one format. Don't show "3 days ago (Feb 27, 2026)".

---

## 8. Accessibility Conventions

Accessibility is not a feature — it is a baseline.

- **Every interactive element is keyboard-navigable.** Tab order follows visual order. Focus is always visible (use the `shadow-focus` ring).
- **Every image has alt text.** Author avatars: `alt="{name}'s avatar"`. Decorative images (if any exist): `alt=""` with `aria-hidden="true"`.
- **Every form input has a label.** Visible labels, not `aria-label` substitutes. If the design cannot accommodate a visible label, the design must change.
- **Colour is never the only indicator.** Links are underlined or have non-colour affordances. Errors have text, not just a red border. Tags are readable without colour (text label is primary).
- **Radix handles the hard parts.** Use Radix primitives for all dialogs, popovers, dropdowns, and toggles. Do not reimplement focus trapping, escape-to-close, or screen reader announcements by hand.
- **Test with keyboard only.** Before any feature is considered done, navigate the entire flow using only Tab, Enter, Escape, and arrow keys. If anything is unreachable or confusing, fix it.

---

## 9. Performance Conventions

### Bundle Discipline

- **No package without justification.** Before adding a dependency, check: does the PRD require this capability? Can it be done with what we already have? Is the package smaller than 20KB gzipped? If it fails any check, reconsider.
- **Tree-shake everything.** Import specific functions: `import { Copy } from "lucide-react"`, never `import * as Icons from "lucide-react"`.
- **Client components are the exception.** The default is server rendering. Every `"use client"` directive should be as low in the component tree as possible — wrap only the interactive leaf, not the entire page.

### Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 1.0s on read view |
| FID (First Input Delay) | < 50ms |
| CLS (Cumulative Layout Shift) | < 0.05 |

The read view (`/n/[id]`) is the performance-critical path. It is server-rendered, has no client JavaScript by default, and loads a single font. Guard this aggressively.

### What Not to Optimise

- Do not add a CDN for avatar images in v1. Supabase/Google's CDN is sufficient.
- Do not add `next/image` optimisation for user-uploaded content — there is no user-uploaded content.
- Do not virtualise the dashboard note list until it demonstrably lags (100+ notes). Premature virtualisation adds complexity for a problem that doesn't exist yet.

---

## 10. Git & Code Quality Conventions

### Commits

- Conventional Commits format: `type(scope): description`.
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`.
- Scope is the feature area: `feat(editor): add file drop support`, `fix(auth): handle expired session redirect`.
- One logical change per commit. Do not bundle unrelated changes.

### Branches

- `main` is always deployable.
- Feature branches: `feat/[short-description]` (e.g. `feat/tag-filtering`).
- Fix branches: `fix/[short-description]` (e.g. `fix/copy-link-safari`).
- No long-lived branches. Merge within days, not weeks.

### TypeScript

- **Strict mode, no exceptions.** `strict: true` in `tsconfig.json`.
- **No `any`.** Use `unknown` and narrow with type guards. If a third-party type is truly opaque, wrap it in a typed interface at the boundary.
- **No type assertions (`as`)** unless interfacing with an untyped external API — and then only at the integration boundary, with a comment.
- **Prefer interfaces over types** for object shapes. Use `type` for unions, intersections, and mapped types.

### Code Comments

- Comments explain *why*, never *what*. If the code needs a comment to explain what it does, the code should be rewritten to be self-evident.
- No commented-out code in the repository. Delete it. Git remembers.
- TODOs are allowed but must reference a concrete scope: `// TODO(v2): add org-only visibility toggle`. Vague TODOs (`// TODO: fix this later`) are not acceptable.

---

## 11. The Non-Negotiables

These are absolute rules. They override any other convention when in conflict.

1. **The read view has zero JavaScript by default.** It is a Server Component that renders HTML. If a future feature requires JS on the read view, it must be loaded lazily and must not affect LCP.

2. **No new database tables without PRD justification.** The schema has five tables (users, notes, tags, note_tags, comments). A sixth table means a new concept, which means new complexity. Exhaust the existing schema first.

3. **No new routes beyond the four defined.** `/`, `/new`, `/n/[id]`, `/n/[id]/edit`. If a feature requires a new route, it either belongs in a modal/dialog within an existing route, or it belongs in v2.

4. **No settings page.** MDrop has no user preferences, no notification settings, no theme toggles, no profile editing. If a "settings" need arises, solve it with a sensible default instead.

5. **No sidebar, ever (v1).** The PRD explicitly excludes sidebars. Navigation is: top bar (wordmark + avatar), page content, done. Any navigation need must be solved within this constraint.

6. **Shared links never require authentication.** This is the product's core promise. No feature should introduce a login wall between a link click and rendered content.

7. **The 30-second rule is measurable.** Time from Google sign-in to a copied shareable link must remain under 30 seconds. Any feature that adds friction to this path must offset it by removing friction elsewhere.

---

## Quick Reference Checklist

Use this before merging any PR:

- [ ] Does this feature exist in the PRD's Core Features (v1)?
- [ ] Does the UI use only the defined design tokens (spacing, colour, radius, shadow)?
- [ ] Is the component a Server Component by default, with `"use client"` only where necessary?
- [ ] Are all interactive elements keyboard-navigable with a visible focus ring?
- [ ] Does the read view (`/n/[id]`) remain free of client-side JavaScript?
- [ ] Is there exactly one primary action visible on the affected screen?
- [ ] Does the feature work without a new database table or route?
- [ ] Is feedback inline (no toasts, no success pages)?
- [ ] Does the 30-second path remain intact?
- [ ] Would removing this feature require a migration? If yes, reconsider.
