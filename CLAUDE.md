# Datahooks Website — CLAUDE.md

## Project Overview

The **datahooks-net/website** repo is the marketing website for **Datahooks** (datahooks.net), a data agency that helps AI-driven companies align their teams, clean their data, and build reliable dashboards and automations.

**Live site**: https://datahooks.net  
**Hosting**: GitHub Pages with custom domain (`CNAME` → `datahooks.net`)  
**Tech stack**: Pure static HTML/CSS/JS — no build system, no framework, no npm

---

## Repository Structure

```
/
├── index.html              # Homepage
├── design.css              # Single global stylesheet (all pages share this)
├── signals.js              # Dot-grid header motion for inner pages
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine directives
├── favicon.ico             # Root-level favicon for browser default discovery
├── CNAME                   # GitHub Pages custom domain (datahooks.net)
├── assets/                 # Images, logos, icons
│   ├── logo-d-white.png    # Logo mark (white) — used on dark/navy backgrounds
│   ├── logo-d-navy.png     # Logo mark (navy) — used on light backgrounds
│   ├── logo-d-color.png    # Logo mark (coral/color variant)
│   ├── logo-square-coral.png  # 512px square logo on coral bg (also used as favicon-512)
│   ├── logo-square-navy.png   # Square logo on navy bg
│   ├── logos/              # Gray SVG logos for the brand and systems strips
│   ├── screens/            # Before/after CRM screen replicas (webp)
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── favicon-512.png
│   └── apple-touch-icon.png
├── about/index.html        # /about/ — Company about page
├── blog/index.html         # /blog/ — Blog listing page
├── contact/index.html      # /contact/ — Contact/lead capture form
├── datahooks/index.html    # /datahooks/ — What is a datahook? (defines the brand term)
├── solutions/index.html    # /solutions/ — What We Do / services page
├── whitepaper/index.html   # /whitepaper/ — Interactive whitepaper with revenue leakage calculator
├── security/index.html     # /security/ — Security information page
├── privacy/index.html      # /privacy/ — Privacy policy
└── terms/index.html        # /terms/ — Terms of service
```

Each page lives in its own directory as `index.html`, enabling clean URLs (e.g., `/contact/` rather than `/contact.html`).

---

## Design System (v2, Notion-inspired)

The full rules live in Notion: **"datahooks.net Design Framework"** (under the Datahooks page). Read it before designing anything new. Short version: lots of white space, ink text on white, color from large soft tinted panels, coral buttons, real product-like "artifact windows" instead of icon cards, sentence-case everything, nothing that reads as AI-generated.

All styles live in the single root-level `design.css` (the old `styles.css` was retired in October 2026). No preprocessor, no framework. Page-level `<style>` blocks are allowed only for truly one-off layouts and must use the `var(--...)` tokens.

### Tokens (see `:root` in design.css)

- Ink: `--ink` #191918, `--ink-2` #5f5e5b, `--ink-3` #8f8d89. Paper: `--paper` #fff, `--paper-2` #f7f6f3, `--line` #e9e8e4
- Brand: `--navy` #1a1a2e, `--coral` #d6456b (logo, big numbers). Buttons use `--coral-btn` #c93d62 so white text passes contrast; secondary uses `--coral-tint` / `--coral-ink`
- Panels: `--panel-gray`, `--panel-coral`, `--panel-navy`, `--panel-sand`, `--panel-sage`; `.panel-dark` is navy (one per page at most)
- Type: Inter for everything, Fraunces (serif) for one quiet moment per page (quotes, the definition). Smallest text 13px
- Shape: buttons 8px radius, windows 12px, panels 20px. One shadow, for windows only

### Components

- `.btn-primary` (coral) + `.btn-soft` (tinted) always as a pair in heroes and closing CTAs; `.btn-plain` for quiet links
- `.page-head` (+ `.inner`, `.compact`) for inner-page titles, left aligned
- `.fpanel.panel.panel-*` feature panel: text left, `.window` bleeding off the bottom right
- `.split` two-column row (text + artifact); `.doc` + `.toc` + `.prose` for long or legal pages
- `.window` artifact (`.window-bar`, `.window-body`, `.window-title`, `.window-sub`) with `.t` tables, `.ba` before/after, `.log`, `.seq` (only for real sequences)
- `.checks` checklist, `.pull` quote, `.tag-*` / `.pill` category labels, `.calc-*` calculator, `.closing` CTA band, `.marquee` scrolling logo strip
- Logos live in `assets/logos/` as gray (#9a9893) SVGs

### Never

Gradient blobs or glows, uppercase eyebrow labels, emoji or icon cards, grids of three identical cards, hover lift, fade-in on scroll, dark navy CTA boxes, em dashes in copy, exclamation points, unsourced stats presented as fact.

---

## Page Anatomy

Every page shares the same head, nav, and footer (copy them from any existing page; there is no templating). Subpages use root-relative paths (`/design.css`, `/assets/...`). Fonts: Inter 400 to 700 plus Fraunces 400 and italic from Google Fonts. Mark the current page with `class="active"` on its nav link.

Nav: What we do, What's a datahook?, Whitepaper, Blog, About, then a plain "Contact" link and a coral "Get a free audit" button. The mobile menu is toggled by `#navToggle`, which adds `.open` to `#nav`.

Footer: light, four columns. The brand line is the tagline "Signals that unlock growth." (serif). Services lists What we do, Data sources, What is a datahook?, and Whitepaper; then Company and Legal (Privacy, Terms, Security).

### Headers (the dot grid)

Every header shares one look: navy dots on white, coral for signals. Three levels:

- **Home**: full-screen hero (`.sig-hero`, script inline in `index.html`). Broken records are scanned into a clean grid, signals gather into labelled clusters with dollar figures, and the headline word is spelled in dots and cycles Growth, Efficiency, Revenue, Clarity, Vision.
- **Moving inner headers**: `<header class="page-head sig-head" data-signal="...">` with a `<canvas class="signal">`, drawn by `/signals.js` (load it with `defer` at the end of the body). Modes: `checks` (What we do: Marketing, Sales, and Finance dots each form a check in their team colour beside every insight), `teams` (spare: the three groups line up into one row), `hook` (Datahooks: one signal lights up at a time), `leak` (Whitepaper: records drain off the grid), `meet` (About: two views meet in one answer).
- **Still headers**: `data-signal="still"` draws the grid once (Blog, Contact, Security). Privacy and Terms use a plain `.page-head.compact` with no grid.

The datahooks page also has a `.finder` panel: a search moves through rows of dots, stops on one, blinks it, and labels it "Datahook found" (also in `signals.js`).

All motion respects `prefers-reduced-motion` and draws its resolved state instead.

### CRM screens

Homepage sections show before and after replicas of HubSpot and Salesforce screens (`assets/screens/*-bad.webp` and `*-fixed.webp`) in a `.screen` figure, switched by a `.ba-switch`. They are illustrations, not client records.

### The term "datahooks"

Datahooks (plural, matching the brand) are *signals that unlock growth*. Following category-design practice, the homepage leads with the problem and introduces the term after it (the "Every business has datahooks. We find yours." section). The full explanation lives on /datahooks/. Do not put the definition above the homepage headline.

---

## Asset Path Convention

This is a common source of bugs:

| Page location | Correct asset path style | Example |
|---|---|---|
| `/index.html` (homepage) | **Relative** | `assets/logo-d-white.png`, `design.css` |
| `/subdir/index.html` (all other pages) | **Root-relative** | `/assets/logo-d-white.png`, `/design.css` |

The homepage uses relative paths because it sits at the root. All subdirectory pages must use root-relative paths (starting with `/`) or assets will 404.

---

## Contact Form

The contact form (`/contact/index.html`) submits via `fetch()` to a **Google Apps Script** endpoint that writes to a Google Sheet.

- The `GOOGLE_SHEETS_URL` constant is hardcoded in the page's `<script>` block
- The form uses `FormData` (not JSON)
- CORS errors from the fetch are **expected and silently caught** — the data still posts successfully to the sheet despite the CORS error
- On submission (success or CORS error), `#formContent` is hidden and `#formSuccess` is shown (via the `hidden` attribute)
- Required fields: First Name, Last Name, Work Email, Company
- Optional fields: Role (select), Company Size (select), Message (textarea)

---

## SEO Conventions

Every page must include:

1. `<title>` — Format: `"Page Name | Datahooks"` (or `"Datahooks | Tagline"` for the homepage)
2. `<meta name="description">` — 1–2 sentences, unique per page
3. `<link rel="canonical">` — Full URL with trailing slash: `https://datahooks.net/page/`
4. OpenGraph: `og:type`, `og:url`, `og:title`, `og:description`, `og:site_name`
5. Twitter Card: `twitter:card` (`summary`), `twitter:title`, `twitter:description`

The homepage additionally includes Schema.org JSON-LD (`@type: Organization`) in a `<script type="application/ld+json">` block.

**Always use trailing slashes** on all internal and canonical URLs (matches GitHub Pages behavior).

When adding new pages, update `sitemap.xml` with the new URL, `changefreq`, and `priority`.

---

## Adding a New Page

1. Create the directory: `new-page-slug/`
2. Create `new-page-slug/index.html` following the page anatomy above
3. Use **root-relative paths** for assets and CSS: `/design.css`, `/assets/...`
4. Copy the navbar HTML from an existing page; set `.active` on the correct nav link
5. Copy the footer HTML from an existing page
6. Include the nav toggle JS in `<script>` at the bottom
7. Add the new URL to `sitemap.xml`
8. If this page is added to the navbar, update the navbar in **every other page** as well

---

## Blog Posts

Currently the blog (`/blog/index.html`) is a listing-only page — all post content is inline HTML cards within `blog/index.html`. There are no individual post pages yet.

When adding a new blog post:
- Add a new entry to the posts list in `blog/index.html`
- If it gets its own page, create `blog/post-slug/index.html` and link to it from the card
- Copy an existing entry in the `.posts` list (category tag, date, read time, title, excerpt)

---

## What NOT to Do

- **No build system**: Do not introduce npm, webpack, Vite, or any framework without explicit discussion. The site is intentionally zero-dependency.
- **No duplicate CSS**: Do not add page-level `<style>` rules that replicate global patterns. Extend `design.css` instead.
- **No wrong asset paths**: Subdirectory pages always use root-relative paths (`/assets/...`), never relative ones (`../assets/...` or `assets/...`).
- **No `.DS_Store` commits**: The repo already has one committed; do not add more. (A `.gitignore` should be added to prevent this.)
- **No trailing whitespace or mixed indentation**: The codebase uses 2-space indentation in HTML files.
- **Do not break the shared footer/navbar**: Edits to shared HTML must be propagated to every page that includes it.
