# Project Rule: TestDino-Inspired Design System

This rule establishes the exact design tokens, typography, colors, and layout rules for the Frontend Agent to match the premium aesthetics of `testdino.com/blog`.

## 1. Color Palette (Premium Cyan/Teal Accents & Off-Black Theme)
We use soft, modern backgrounds combined with vibrant sky-blue/cyan accents. Define these as CSS variables in `index.css`:

```css
:root {
  /* Default: Dark Mode (Premium Off-Black Theme with Vibrant Cyan/Teal accents) */
  --font-sans: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
  
  --color-bg: #09090b;                /* Near black */
  --color-bg-offset: #18181b;         /* Zinc 900 for cards, sections */
  --color-bg-muted: #222225;          /* Card/Button default background */
  
  --color-text: #e4e4e7;              /* Zinc 200 light text */
  --color-text-muted: #9ca3af;        /* Zinc 400 subtext */
  --color-text-highlight: #ffffff;
  
  --color-border: rgba(63, 63, 70, 0.4); /* Zinc 700 soft border */
  
  /* Primary Accent & Brand Colors */
  --color-primary: #0ea5e9;           /* Vibrant Cyan/Sky-Blue */
  --color-primary-hover: #38bdf8;
  --color-accent: #0ea5e9;
  --color-accent-hover: #38bdf8;
  --color-brand-gradient: linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%);
  
  --color-tag-bg: rgba(14, 165, 233, 0.08);
  --color-tag-text: #38bdf8;
}

:root.light {
  /* Light Mode (Soft Off-White Theme with Elegant Slate-Blue/Teal accents) */
  --color-bg: #f8fafc;                /* Slate 50 light blue background */
  --color-bg-offset: #ffffff;         /* Card details, headers */
  --color-bg-muted: #f1f5f9;          /* Hover states, border lines */
  
  --color-text: #1e293b;              /* Slate 800 dark text */
  --color-text-muted: #64748b;        /* Slate 500 secondary text */
  --color-text-highlight: #0f172a;
  
  --color-border: rgba(226, 232, 240, 0.8); /* Slate 200 border */
  
  /* Primary Accent & Brand Colors */
  --color-primary: #0284c7;           /* Sky Blue */
  --color-primary-hover: #0369a1;
  --color-accent: #0284c7;
  --color-accent-hover: #0369a1;
  --color-brand-gradient: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
  
  --color-tag-bg: rgba(2, 132, 199, 0.06);
  --color-tag-text: #0284c7;
}
```

## 2. Page Typography Rules
*   **Headings**: Set `letter-spacing: -0.02em` and `font-weight: 700` or `800`. Use brand logo typography.
*   **Body Content**: Set font size to `1rem` (16px) or `1.0625rem` (17px) with `line-height: 1.625` or `1.7` for comfortable reading. Use `var(--color-text)` with `opacity: 0.85` or `var(--color-text-muted)` for body copy.
*   **Fonts**: The primary font-family must be imported from Google Fonts:
    ```css
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    ```

## 3. Component Layout & Sizing Constants
*   **Max Width Container**: Use `max-width: 1360px` (`.container`) for grids/sections and `max-width: 750px` for single-article contents.
*   **Card Styling (TestDino Card)**:
    *   Border: `1px solid var(--color-border)`.
    *   Border radius: `var(--radius-lg)` (12px).
    *   Transition: `transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease-in-out`.
    *   Hover state:
        ```css
        .card:hover {
          transform: translateY(-3px);
          border-color: var(--color-text-muted);
          box-shadow: var(--shadow-md);
        }
        ```
    *   Card Thumbnail Hover: Zoom in by `1.03` scale:
        ```css
        .card-image-wrapper img {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card:hover .card-image-wrapper img {
          transform: scale(1.03);
        }
        ```

## 4. UI Layout Rules
*   **Animated Scroll-to-Hide Header**: Translucent with backdrop blur of `16px`. Hides when scrolling down, reveals when scrolling up.
    - Uses `transform: translateY(-100%)` for `.header--hidden` and `translateY(0)` for active.
    - Transitions on `transform var(--transition-normal)`.
    - Features a 2px thin gradient accent bar (`var(--color-brand-gradient)`) on top using the `::before` pseudo-element.
*   **Mobile Sidebar Drawer**:
    - Triggered by a `.mobile-menu-btn` (Menu hamburger icon).
    - Slide-out drawer `.sidebar-panel` (width: `280px`) using `transform: translateX(100%)` to `translateX(0)`.
    - Contains logo title, close button (`X` icon), and vertical navigation links list.
    - Backed by `.sidebar-backdrop` with backdrop-filter blur `4px`.
*   **Multi-Column Portfolio Footer**:
    - Organized in a 3-column layout:
      - Left: Brand description, email address, and phone number links.
      - Center: Quick link navigation buttons.
      - Right: Round hover social icons (Github, Linkedin, Facebook).
*   **Category Pills**: Selected pill has active gradient backgrounds (`var(--color-brand-gradient)`). Inactive pills have tag colors with soft border.
*   **Responsive Breakpoints**:
    - Mobile: `< 768px` (Hides desktop nav header, displays hamburger button, collapses footer columns, single column post card layout).
    - Tablet: `768px` to `1024px` (Two columns grid).
    - Desktop: `> 1024px` (Three columns grid, two columns article view with sticky table of contents).
