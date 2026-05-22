# Design System — TestDino-Inspired (Jason's Diary)

Reference: [testdino.com/blog](https://testdino.com/blog)  
Source of truth for tokens: `src/index.css`  
Page-specific CSS lives next to each page/component (see [File map](#file-map)).

**Related docs for agents:**  
- Rules: `.rules/frontend.md`, `.rules/project_rules.md`, `.rules/qc.md`  
- Skills: `.agents/skills/layout-implementation/SKILL.md`, `.agents/skills/image-optimization/SKILL.md`

Use this guide before adding or changing UI so new screens stay consistent with the existing blog.

---

## 1. Design principles

1. **Premium, readable, calm** — generous whitespace, subtle motion; **large sections flow together without outer borders**.
2. **Warm editorial palette** — cream/linen surfaces with sand accent (`#C9B59C`); dark mode uses warm charcoal, not cold zinc.
3. **Light mode default** — stored preference in `localStorage`; toggle in header.
4. **TestDino layout fidelity** — match spacing, column proportions, and typography scale from TestDino; colors use our palette, not TestDino’s exact cream/white hex values.
5. **Tokens over hard-coded values** — prefer CSS variables from `index.css` or page-scoped layout vars (e.g. `--post-layout-max`).
6. **Mobile-first** — single column by default; expand at `640px`, `768px`, `1024px`.

---

## 2. Global design tokens

Defined in `src/index.css`. Do not duplicate hex values in page CSS unless documenting an exception.

### 2.1 Brand palette (source)

These four colors are the **brand source of truth**. Map them to semantic tokens — do not scatter raw hex in components.

| Swatch | Hex | Token | Role |
|--------|-----|-------|------|
| Cream | `#F9F8F6` | `--palette-cream` | Light page background (canvas) |
| Linen | `#EFE9E3` | `--palette-linen` | Muted fills, hover states (light) |
| White | `#FFFFFF` | `--palette-white` | Cards, hero bands, footer (light) |
| Taupe | `#D9CFC7` | `--palette-taupe` | Borders, muted text (dark), secondary surfaces |
| Sand | `#C9B59C` | `--palette-accent` | Primary accent, gradients, tags, links |

### 2.2 Semantic colors — light mode (`:root.light`)

| Token | Maps to | Usage |
|-------|---------|--------|
| `--color-bg` | `--palette-cream` | Page canvas (warm off-white) |
| `--color-bg-offset` | `--palette-white` | **Cards, hero, footer, TOC** |
| `--color-bg-muted` | `--palette-linen` | Hover, inputs, code blocks |
| `--color-text` | `#3d3832` | Body copy |
| `--color-text-muted` | `#6b6258` | Meta, captions |
| `--color-text-highlight` | `#2a2520` | Headings |
| `--color-border` | taupe @ 90% opacity | Dividers |
| `--color-primary` | `#a8926f` | Links, focus (darker accent for contrast) |
| `--color-brand-gradient` | `#C9B59C → #b9a088` | Primary buttons, logo gradient |
| `--color-on-accent` | `#2a2520` | Text on gradient buttons |
| `--color-tag-bg` / `--color-tag-text` | sand tint | Tags, inactive pills |

### 2.3 Semantic colors — dark mode (`:root` default without `.light`)

| Token | Value | Usage |
|-------|-------|--------|
| `--color-bg` | `#1a1714` | Warm charcoal page bg |
| `--color-bg-offset` | `#252019` | Cards, sections |
| `--color-bg-muted` | `#302a23` | Hover, inputs |
| `--color-text` | `--palette-cream` | Body |
| `--color-text-muted` | `--palette-taupe` | Secondary text |
| `--color-primary` | `--palette-accent` | Links, accents |
| `--color-brand-gradient` | `#C9B59C → #D9CFC7` | Buttons, logo |

### 2.4 Utility tokens (both themes)

| Token | Usage |
|-------|--------|
| `--color-accent-subtle` | Hover fills, tag backgrounds |
| `--color-accent-border` | Tag/card accent borders |
| `--color-accent-glow` | Ambient hero glow |
| `--color-header-bg` / `--color-header-border` | Sticky header glass |
| `--color-focus-ring` | Input/button focus ring |
| `--color-overlay` | Mobile drawer backdrop |

**Rule:** Use `--color-accent-subtle`, `--color-accent-border`, etc. instead of hard-coded rgba accent values.

**Borders:** No `border-top` / `border-bottom` on large shells (header, home/post/about hero bands, footer). Keep borders on cards, inputs, TOC, tags, tables, and in-card dividers.

### 2.5 Radius, shadow, motion

| Token | Value |
|-------|-------|
| `--radius-xl` | `16px` — featured cards |
| `--radius-lg` | `12px` — post cover, TOC, author box, card thumbs |
| `--radius-md` | `8px` — buttons, inputs |
| `--radius-full` | pill shapes (search, tags, avatars) |
| `--shadow-sm` / `--shadow-md` / `--shadow-lg` | elevation |
| `--transition-fast` | `0.15s` |
| `--transition-normal` | `0.3s` |
| `--transition-slow` | `0.5s` — image zoom on card hover |

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth, premium feel).

### 2.6 Layout containers (site-wide)

| Token | px | Usage |
|-------|-----|--------|
| `--layout-max` | `1268px` (79.25rem) | `.container` — homepage grid, header, footer |
| `--layout-narrow` | `896px` (56rem) | `.container-narrow` — hero text block on home |
| `--layout-gutter` | `32px` (2rem) | Horizontal padding on containers |

```html
<div class="container">…</div>           <!-- max 1268px -->
<div class="container container-narrow">…</div>  <!-- max 896px -->
```

### 2.7 Article page layout (scoped)

Defined on `.post-detail-page` in `src/pages/BlogPost.css`:

| Token | Value | Usage |
|-------|-------|--------|
| `--post-layout-max` | `var(--layout-max)` (1268px) | Same outer width as home/about/admin |
| Prose column | `minmax(0, 1fr)` in grid | Fills space left of TOC |
| `--post-sidebar-width` | `300px` | Sticky TOC |
| `--post-layout-gap` | `60px` | Gap between content and sidebar |
| `--post-sticky-top` | `calc(4.5rem + 1.25rem)` | Sticky TOC + scroll offset below header |

Post pages use the **same container width** as other pages; body uses a **2-column grid** (prose + 300px TOC). TOC sticks on scroll; long TOCs scroll inside `.toc-scroll`.

---

## 3. Typography

**Font:** `Be Vietnam Pro` (loaded in `index.html` / `index.css`) — not Plus Jakarta Sans.

### 3.1 Global defaults (`index.css`)

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| `body` | `1rem` | 400 | `line-height: 1.625` |
| `h1`–`h6` | see index | `800` | `letter-spacing: -0.02em` |
| `.btn` | `0.875rem` | `600` | inline-flex, gap `0.5rem` |

### 3.2 By page context

| Context | Selector | Desktop size | Line height |
|---------|----------|--------------|-------------|
| Home hero title | `.home-title` | `clamp(1.875rem, 4vw, 2.5rem)` | `1.15` |
| Home subtitle | `.home-subtitle` | `1rem` | `1.65` |
| Featured card title | `.featured-title` | `1.5rem` (lg) | `1.3` |
| Latest card title | `.card-title` | `1.0625rem` | `1.35` |
| **Post hero H1** | `.post-header-title` | `clamp(1.875rem, 4vw, 2.75rem)` (~44px) | `1.15` |
| Post summary | `.post-header-summary` | `1rem` | `1.5` |
| **Article body** | `.post-detail-page .markdown-body` | `1rem` | `1.5` |
| Article H2 | `.markdown-body h2` | `1.5rem` | `1.3` |
| Article H3 | `.markdown-body h3` | `1.25rem` | `1.35` |
| TOC title | `.toc-title` | `0.9375rem` | `1.3` |
| TOC link | `.toc-item` | `0.875rem` | `1.4` |
| Back link | `.post-back-link` | `0.875rem` | `1.25` |
| Tag pill | `.post-tag` | `0.6875rem` | uppercase, `700` |

**Rule:** Long-form reading uses **16px / 1.5** on post pages. Outer container matches `--layout-max`; prose column fills remaining space beside the TOC.

---

## 4. Breakpoints

| Name | Min width | Typical layout |
|------|-----------|----------------|
| Mobile | default | 1 column; TOC hidden on posts; hamburger nav |
| `sm` | `640px` | 2-column latest grid |
| `md` | `768px` | Featured card horizontal; footer 2 cols |
| `lg` | `1024px` | 3-column post grid; post hero 50/50; TOC visible |

Standard media queries in this project: `@media (min-width: 640px)`, `768px`, `1024px`.

---

## 5. Page templates

### 5.1 Blog homepage (`BlogHome.tsx` + `BlogHome.css`)

```
.home-wrapper
  .home-hero (.container-narrow)
    title, subtitle, category pills, search
  .container
    .featured-section → .featured-card (horizontal on md+)
    .latest-section → .latest-grid (1 → 2 → 3 cols)
    .more-section → .more-grid
```

| Element | Spec |
|---------|------|
| Featured card | `border-radius: var(--radius-xl)`, padding `1rem`, bg `--color-bg-offset` |
| Featured image | `50%` width on md+, height `18.75rem` (md) / `21.25rem` (lg), thumb radius `--radius-lg` |
| Latest grid | 1 col → 2 (`640px`) → 3 (`1024px`), gap `1.25rem` |
| Card hover | `translateY(-3px)`, image `scale(1.02–1.03)` |
| Author on cards | Avatar **24×24**, meta `0.8125rem` |

### 5.2 Blog post detail (`BlogPost.tsx` + `BlogPost.css`)

Reference: [testdino.com/blog/playwright-1-60-release](https://testdino.com/blog/playwright-1-60-release)

```
.post-detail-page
  .post-header-banner          ← bg-offset (no section border)
    .container
      .post-back-link          ← top of hero, links to /
      .post-header-grid        ← column → row at 1024px
        .post-header-info      ← tags, h1, summary, author
        .post-header-cover     ← 50% width on desktop
  .post-body-section           ← bg default (contrasts with hero)
    .post-body-container       ← content + sidebar, gap 60px
      .post-content-column     ← flex prose column (fills space beside TOC)
      .post-sidebar            ← TOC, hidden below 1024px
```

| Element | Spec |
|---------|------|
| Hero padding | `3.75rem 0 2.5rem` mobile → `5rem 0 3.75rem` desktop |
| Cover aspect | `563 / 338`, radius `--radius-lg` |
| Author avatar (hero) | **48×48**, name + date **stacked** in `.author-meta` |
| TOC card | width **300px**, sticky on `.post-sidebar`, `top: var(--post-sticky-top)` |
| Back to top | Global `BackToTop` in `App.tsx` — portaled to `document.body`, visible after 480px scroll, fixed `.back-to-top-btn` with `ArrowUp`, `z-index: 100`, `data-testid="btn-back-to-top"`, i18n `common.backToTop` |
| TOC active item | `border-left: 3px solid var(--color-text-highlight)` |
| Author box (footer of article) | offset bg, radius lg, margin-top `3rem` |

**Back navigation:** use `<Link class="post-back-link" data-testid="link-back-articles">` in the hero — not a button in the body.

### 5.3 Header (`Header.tsx` + `Header.css`)

- Sticky, `backdrop-filter: blur(16px)`, bg `--color-header-bg`.
- **No shadow at page top** (`scrollY ≤ 8px`) — blends with hero.
- **Shadow on `.header--elevated`** when scrolled — uses `--shadow-header` (stronger than `--shadow-md`).
- Scroll-to-hide: `.header--hidden` → `translateY(-100%)`.
- Mobile drawer: `.sidebar-panel` width **280px**, slide from right.

### 5.4 Footer (`Footer.tsx` + `Footer.css`)

- 3 columns at `1024px`: brand `2fr` + links + social.
- Social icons: **36×36** circles, hover lift + primary fill.
- Contact links: `0.875rem`, muted color.

### 5.5 Admin (`AdminEditor.css`, `AdminDashboard.css`)

- Page padding top `2rem`, bottom `5rem`.
- Back control: pill-shaped `.editor-back-link` (border + offset bg) — different from public post back link.
- Form sections: `.editor-section` cards with offset background.
- Status select + primary actions in `.editor-page-header`.

### 5.6 Login (`Login.css`)

- Centered card on ambient glow background.
- Mock credentials helper only when `isDevMockAuthEnabled` (dev + no Supabase).

---

## 6. Reusable components

### 6.1 Buttons

| Class | Use |
|-------|-----|
| `.btn.btn-primary` | Main CTA — gradient, white text |
| `.btn.btn-secondary` | Secondary — offset bg + border |
| `.btn.btn-danger` | Destructive actions |

Hover: slight `translateY(-1px)` on primary; never remove focus visibility.

### 6.2 Tags & category pills

| Component | Active state | Inactive |
|-----------|--------------|----------|
| `.category-pill` | `--color-text-highlight` bg + `--color-bg` text | tag bg + border |
| `.post-tag` | uppercase micro label on post hero | cyan tint |

### 6.3 Cards (shared pattern)

```css
border: 1px solid var(--color-border);
border-radius: var(--radius-lg); /* or xl for featured */
background-color: var(--color-bg-offset);
transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
```

Hover: `translateY(-3px)`, `box-shadow: var(--shadow-md)`.

### 6.4 Markdown (`.markdown-body`)

Global styles in `index.css`; **post pages override** in `BlogPost.css` (smaller headings, no h2 border-bottom).

Code: inline `code` with muted bg; `pre` blocks with border + radius md.

### 6.5 Cover images

| Context | Aspect / size | Radius |
|---------|---------------|--------|
| Featured card | `16/10`, fixed height on desktop | `--radius-lg` |
| Post hero | `563/338` | `--radius-lg` |
| Generated cover (no URL) | SVG mesh + title, `CARD_BORDER_RADIUS = 12` | Vibrant random mesh colors (independent of site palette) |

Use `getOptimizedCoverImage()` + `resolvePostCoverImage()` for URLs.

### 6.6 Post tags input (`PostTagsInput.css`)

Autocomplete chip input for admin editor — reuse for any tag-picker UI.

---

## 7. Imagery & performance

- Always set `width`, `height`, `decoding="async"` on above-the-fold images.
- Hero cover: `fetchPriority="high"`.
- Card/list images: lazy load where appropriate.
- Prefer `content-visibility: auto` on long lists (see `.latest-card`, `.more-card`).

Skill reference: `.agents/skills/image-optimization/SKILL.md`

---

## 8. i18n

- Copy via `react-i18next` — keys in `src/i18n/locales/en.json` and `vi.json`.
- Add **both** locales when introducing user-facing strings.
- Tests may match English strings or regex (`/Table of Contents|Mục lục/i`).

---

## 9. Testing conventions

- Public flows: `data-testid` on nav, cards (`card-post-*`), login, footer links.
- Post back link: `data-testid="link-back-articles"`.
- Page objects in `tests/pages/` — update selectors when changing roles/structure.

Run: `npx playwright test`

---

## 10. Checklist — adding new UI

Before opening a PR:

- [ ] Uses `--color-*`, `--radius-*`, `--layout-*` tokens (no random hex/spacing).
- [ ] Matches breakpoint scheme (`640` / `768` / `1024`).
- [ ] Typography fits the page context table (§3.2).
- [ ] Works in **dark and light** (`:root.light` overrides considered).
- [ ] Mobile layout checked (single column, no horizontal overflow).
- [ ] Interactive elements have hover/focus/disabled states.
- [ ] User-facing text added to `en.json` + `vi.json`.
- [ ] `data-testid` added for elements covered by E2E tests.
- [ ] Page-specific CSS in `PageName.css`, not dumped into `index.css` unless truly global.
- [ ] If layout mirrors TestDino, verify against live reference or `.agents/skills/layout-implementation/SKILL.md`.

---

## 11. File map

| Area | Component / page | Styles |
|------|------------------|--------|
| Global tokens | — | `src/index.css` |
| Header | `src/components/Header.tsx` | `Header.css` |
| Footer | `src/components/Footer.tsx` | `Footer.css` |
| Back to top | `src/components/BackToTop.tsx` | `BackToTop.css` |
| Home | `src/pages/BlogHome.tsx` | `BlogHome.css` |
| Post detail | `src/pages/BlogPost.tsx` | `BlogPost.css` |
| About | `src/pages/About.tsx` | `About.css` |
| Login | `src/pages/Login.tsx` | `Login.css` |
| Admin list | `src/pages/AdminDashboard.tsx` | `AdminDashboard.css` |
| Admin editor | `src/pages/AdminEditor.tsx` | `AdminEditor.css` |
| Tags input | `src/components/PostTagsInput.tsx` | `PostTagsInput.css` |
| Layout skill (HTML/CSS templates) | — | `.agents/skills/layout-implementation/SKILL.md` |

---

## 12. Do / Don’t

| Do | Don’t |
|----|--------|
| Reuse `.container` and page layout vars | Hard-code `max-width: 1200px` per page |
| Stack author name + date on post hero | Inline `name · date` on post detail |
| Put post back link in hero | Put back button inside markdown column |
| Keep article prose at 16px/1.5 | Use 17px+ body on post pages without reason |
| Use gradient primary for main CTAs | Use cyan/teal or random hex outside tokens |
| Scope post overrides under `.post-detail-page` | Override `.markdown-body` globally for one page |

---

*Last updated: warm editorial palette (`#F9F8F6`, `#EFE9E3`, `#D9CFC7`, `#C9B59C`).*
