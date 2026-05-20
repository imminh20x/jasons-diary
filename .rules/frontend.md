# Frontend Agent Rules & Guidelines

This document outlines specific guidelines and rules for the **Frontend Agent (FE)**.

## 1. Core Technical Mandates
*   **Framework**: React (built with Vite).
*   **CSS**: Vanilla CSS. Write modular CSS to prevent stylesheet leakage.
*   **State Management**: Use React Hooks (`useState`, `useContext`, `useRef`, `useMemo`) for local and global UI states. Avoid heavy state libraries like Redux.

## 2. Testability & Playwright Integration (Critical)
The Frontend Agent must write code that is easy to test:
*   **No Hidden Elements for Clicks**: Ensure elements intended for clicks are actual interactive elements (`<a>` or `<button>`) and are not covered by invisible overlays.
*   **Mandatory `data-testid`**:
    *   **Forms**:
        *   Login email input: `data-testid="input-login-email"`
        *   Login password input: `data-testid="input-login-password"`
        *   Login submit button: `data-testid="btn-login-submit"`
    *   **Post Editor**:
        *   Title input: `data-testid="input-post-title"`
        *   Content textarea: `data-testid="textarea-post-content"`
        *   Tags input: `data-testid="input-post-tags"`
        *   Publish button: `data-testid="btn-post-publish"`
        *   Cancel/Back button: `data-testid="btn-post-cancel"`
    *   **Main & Mobile Navigation**:
        *   Logo / Home link: `data-testid="nav-link-home"`
        *   About link: `data-testid="nav-link-about"`
        *   Admin dashboard link: `data-testid="nav-link-admin"`
        *   Theme toggle button: `data-testid="btn-theme-toggle"`
        *   Mobile hamburger menu button: `data-testid="btn-mobile-menu"`
        *   Mobile sidebar drawer close button: `data-testid="btn-sidebar-close"`
        *   Mobile sidebar Home link: `data-testid="sidebar-link-home"`
        *   Mobile sidebar About link: `data-testid="sidebar-link-about"`
        *   Mobile sidebar Admin/Login link: `data-testid="sidebar-link-admin"`
    *   **Blog Feed**:
        *   Post list container: `data-testid="blog-posts-list"`
        *   Individual post cards: `data-testid="card-post-[id]"` (where `[id]` is the unique post ID or slug)
        *   Read more link: `data-testid="link-read-more-[id]"`
    *   **Portfolio page (About)**:
        *   Contact email button: `data-testid="btn-contact-email"`
        *   GitHub profile link: `data-testid="link-github"`
        *   LinkedIn profile link: `data-testid="link-linkedin"`
    *   **Multi-Column Footer**:
        *   Contact email: `data-testid="footer-email"`
        *   Contact phone: `data-testid="footer-phone"`
        *   Social GitHub link: `data-testid="footer-social-github"`
        *   Social LinkedIn link: `data-testid="footer-social-linkedin"`
        *   Social Facebook link: `data-testid="footer-social-facebook"`
*   **Consistent ARIA Roles**: Use proper semantic roles. If a custom interactive component is built, add appropriate roles (`role="button"`, `role="dialog"`, etc.) and ensure keyboard navigation works.

## 3. Aesthetics, Animations & Theme
*   **CSS Variables**: All colors, fonts, margins, transitions, and border radius must reference design tokens in `index.css`.
*   **Smooth Hover Effects**: Always add transitions for styling changes (e.g., `transition: background-color 0.2s ease-in-out, transform 0.2s ease`).
*   **Responsive Mobile Layout**: Ensure layout collapses cleanly below `768px`. Render Hamburger icons, side drawers, and stacked grids.
*   **Animations**: Leverage standard CSS Keyframes or the Web Animations API for loading states, page entries, and slide transitions (e.g. mobile drawer translateX).
*   **Image Loading**: Implement modern loading strategies:
    *   Set `loading="lazy"` on below-the-fold images.
    *   Specify explicit `width` and `height` on images to avoid Layout Shifts (CLS).

## 4. Quality Standard
*   No unused React imports or variables.
*   No inline styles unless calculating dynamic layout coordinates (e.g., cursor hover effects).
*   Code must pass ESLint and TypeScript compilation without errors.
