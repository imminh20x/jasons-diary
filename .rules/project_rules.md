# Project Rules: Premium Blog Web Application

This document outlines the global rules, style guide, and architecture constraints for our Blog Web Application. All AI agents (FE, BE, QC) and human developers must adhere to these rules.

## 1. Tech Stack Overview
*   **Frontend**: React (built with Vite), Single Page Application (SPA).
*   **Styling**: Vanilla CSS (custom variables, modern CSS grid/flexbox, zero styling libraries like TailwindCSS unless explicitly requested).
*   **Backend & Database**: Supabase (Database, Auth, and Storage).
*   **Testing & Quality Control**: Playwright for end-to-end (E2E) testing.
*   **Package Manager**: `npm`.

## 2. Design System & Aesthetics (Premium Quality)

**Primary reference:** [.rules/design_system.md](design_system.md) — tokens, page templates, typography, and UI checklist.  
**Layout templates:** [.agents/skills/layout-implementation/SKILL.md](../.agents/skills/layout-implementation/SKILL.md)

Our application must deliver a premium user experience with state-of-the-art visual design.

*   **Typography**: **Be Vietnam Pro** (see `index.css`). Headings use tight letter-spacing (`-0.02em` to `-0.03em`), weight `700`–`800`.
*   **Layout width**: Public pages use `.container` → `--layout-max` (`79.25rem`). Post pages use the **same outer width**; inner split is prose + 300px TOC (see `BlogPost.css`).
*   **Color Palette**: Warm editorial palette — cream `#F9F8F6`, linen `#EFE9E3`, taupe `#D9CFC7`, sand accent `#C9B59C`. Full token map: [.rules/design_system.md](design_system.md).
*   **Visual Style**: Subtle borders, offset section backgrounds, soft shadows — not heavy glassmorphism on every surface.
*   **Interactions**: Hover states dynamic but subtle (e.g., card `translateY(-3px)`, image `scale(1.02–1.03)`, `var(--transition-normal)`).
*   **Dark Mode**: Dark mode uses warm charcoal (`#1a1714`) with sand accents; light mode uses the brand cream/linen palette.

## 3. SEO & Accessibility (a11y)
*   **Semantic Elements**: Use HTML5 semantic tags (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<aside>`, `<nav>`).
*   **Heading Structure**: Exactly one `<h1>` per page. Follow a strict nested heading structure (`<h2>` for subheadings, `<h3>` for nested subheadings).
*   **Accessibility Labels**: Every image must have an `alt` attribute. Interactive elements must be keyboard navigable and focus-visible. Use ARIA attributes (`aria-expanded`, `aria-hidden`) where dynamic states change.

## 4. Playwright Testability Contract (Critical)
To ensure the QC Agent can easily test the interface without fragile locators:
*   **Interactive Elements**: All buttons, inputs, links, forms, and dynamic cards must contain a unique `data-testid` attribute.
*   **TestID Naming Convention**: Use lowercase kebab-case in the format `[component]-[action-or-descriptor]`.
*   **Best Practices**: All E2E test structures and page object definitions must adhere strictly to the guidelines in [.rules/qc.md](file:///Users/dcaomnh20x/Documents/blog-web-application/.rules/qc.md) and [.rules/playwright_pom.md](file:///Users/dcaomnh20x/Documents/blog-web-application/.rules/playwright_pom.md).
*   **Semantic Roles**: Prefer using Playwright's semantic locators (e.g., `page.getByRole('button', { name: 'Đăng nhập' })`) where possible, complemented by `data-testid` for structural selections.
