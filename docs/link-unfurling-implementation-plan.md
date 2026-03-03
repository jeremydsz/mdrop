# Link Unfurling Implementation Plan

## Goal

Make MDrop note links look great when pasted in Slack, Discord, Twitter/X, iMessage, and any other platform that unfurls URLs. Zero UI changes to MDrop itself — the clipboard remains the share mechanism; we just make the result of pasting richer.

## Current State

The `/n/[id]` page already has a `generateMetadata` function that produces basic Open Graph tags — `og:title`, `og:description`, `og:type`, `article:author`, and publish/modified times.

### What's missing

1. **No `og:image`** — the biggest gap. Slack and every other unfurling service prioritize the image. Without one, you get a plain text card that's easy to scroll past.
2. **No `metadataBase`** — Next.js needs this to resolve relative OG URLs into absolute ones. Without it, `og:url` and `og:image` may not resolve correctly.
3. **No Twitter card tags** — Twitter/X uses its own `twitter:card`, `twitter:title`, etc. Without these, Twitter falls back to OG tags but may not pick the right card format.
4. **Crude description extraction** — current logic slices 160 chars and strips `#*_`` with a simple regex. Markdown links, images, blockquotes, and list markers leak through.

---

## Implementation Steps

### Step 1: Set `metadataBase` in the root layout

Add `metadataBase` to the root layout's metadata export so all OG URLs resolve to absolute paths. Required for `og:image` and `og:url` to work.

**File:** `src/app/layout.tsx`

Use an environment variable (`NEXT_PUBLIC_SITE_URL` or similar) with a localhost fallback for dev.

### Step 2: Create a dynamic OG image route

Use Next.js's file-convention OG image generation: create an `opengraph-image.tsx` file inside `src/app/n/[id]/`. This automatically:

- Generates an image at request time using `ImageResponse` from `next/og`
- Injects the correct `og:image` meta tag — no manual wiring needed

**File:** `src/app/n/[id]/opengraph-image.tsx`

**Design for the generated image:**

- 1200x630px (standard OG size)
- Clean white background matching MDrop's aesthetic
- Note title in Geist Sans (display weight, large)
- Author name + avatar below the title
- Tags as small chips if present
- Subtle MDrop wordmark in the bottom corner
- Minimal — no gradients, no decorative elements, consistent with design philosophy

The image fetches the note data from Supabase (same as the page does) and renders it to a PNG via `ImageResponse`.

**Note:** `next/og` uses Satori under the hood, which supports a subset of CSS (flexbox only, no grid). The layout needs to account for this.

### Step 3: Improve description extraction

Add an `extractDescriptionFromMarkdown` helper to `src/lib/markdown.ts` that strips markdown more thoroughly for use in meta descriptions.

**Strip:** headings, bold/italic markers, links (keep link text), images (use alt text), blockquotes, list markers, horizontal rules, code fences, inline code backticks, HTML tags.

**Produce:** a clean plaintext sentence fragment, truncated to ~155 characters on a word boundary, with an ellipsis if truncated.

### Step 4: Enhance `generateMetadata` on the read view

**File:** `src/app/n/[id]/page.tsx`

Update the existing `generateMetadata` to:

- Use the improved description extraction
- Add `url` to openGraph (Next.js resolves this against `metadataBase`)
- Add `siteName: "MDrop"` to openGraph
- Add `tags` array from the note's tags
- Add Twitter card metadata (`twitter:card` as `summary_large_image` to show the OG image prominently)

The `og:image` is handled automatically by the `opengraph-image.tsx` file convention — no need to specify it manually in `generateMetadata`.

### Step 5: Add a default OG image for non-note pages

Create a root-level `opengraph-image.png` (static) or `opengraph-image.tsx` (dynamic) in `src/app/` for the homepage, login, and any other non-note routes. Gives a branded fallback when someone shares the MDrop homepage link.

**File:** `src/app/opengraph-image.png` (static) or `src/app/opengraph-image.tsx` (dynamic)

A simple static image with the MDrop wordmark and tagline is sufficient — no need for dynamic generation on the homepage.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add `metadataBase` |
| `src/app/n/[id]/opengraph-image.tsx` | **New** — dynamic OG image generation |
| `src/app/n/[id]/page.tsx` | Enhance `generateMetadata` (description, siteName, url, twitter, tags) |
| `src/lib/markdown.ts` | Add `extractDescriptionFromMarkdown` helper |
| `src/app/opengraph-image.png` | **New** — static default OG image |

---

## Validation

- Paste a note link in Slack — should show image, title, description, and MDrop branding.
- Paste in Discord, Twitter/X, iMessage — same rich preview.
- Use [opengraph.xyz](https://opengraph.xyz) or the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to verify tag parsing.
- Confirm the read view remains a Server Component with zero client JS.
- Confirm no LCP regression (the OG image is generated on a separate route, not on the page itself).

## Risks

- **Satori font loading:** `next/og` needs fonts loaded explicitly (can't use `next/font`). The Geist Sans `.ttf` file must be fetched at image generation time. Well-documented pattern but worth noting.
- **Cold start latency:** first OG image request for a note may be slow (~1-2s) if the serverless function cold-starts. Subsequent requests are cached. Not user-facing since unfurling happens asynchronously.
- **Supabase double-fetch:** the OG image route fetches the same note data as the page. This is fine — they're separate requests triggered at different times (page load vs. unfurl bot crawl).

## Estimated Effort

- Build: small-medium (3 files changed, 1-2 new files, ~100-200 LOC)
- Polish: small (mostly visual tuning of the OG image layout)
