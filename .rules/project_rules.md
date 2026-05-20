# Project Rules: Premium Blog Web Application

This document outlines the global rules, style guide, and architecture constraints for our Blog Web Application. All AI agents (FE, BE, QC) and human developers must adhere to these rules.

## 1. Tech Stack Overview
*   **Frontend**: React (built with Vite), Single Page Application (SPA).
*   **Styling**: Vanilla CSS (custom variables, modern CSS grid/flexbox, zero styling libraries like TailwindCSS unless explicitly requested).
*   **Backend & Database**: Supabase (Database, Auth, and Storage).
*   **Testing & Quality Control**: Playwright for end-to-end (E2E) testing.
*   **Package Manager**: `npm`.

## 2. Design System & Aesthetics (Premium Quality)
Our application must deliver a premium user experience with state-of-the-art visual design.
*   **Typography**: Use modern Google Fonts (e.g., 'Plus Jakarta Sans', 'Outfit', or 'Inter') instead of browser default fonts.
*   **Color Palette**: Use curated HSL CSS custom variables for easy theme changes. Avoid pure, raw primary colors. Use smooth, modern gradient backgrounds.
*   **Visual Style**: Clean glassmorphism (`backdrop-filter: blur()`), subtle border glows, shadow depths, and modern spacing (prefer clamp/rem over pixels).
*   **Interactions**: Hover states must be dynamic but subtle (e.g., scale up by `1.02`, translate up, smooth transition duration of `0.2s` or `0.3s`).
*   **Dark Mode**: Dark mode is the primary default theme. Light mode must be clean and soft (no high-contrast white pages).

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
