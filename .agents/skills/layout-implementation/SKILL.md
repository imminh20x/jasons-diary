---
name: layout-implementation
description: HTML structure and CSS templates for testdino.com/blog-inspired layouts. Canonical tokens and widths live in .rules/design_system.md.
---

# TestDino Layout Implementation Guide

This skill provides HTML structure and CSS templates inspired by [testdino.com/blog](https://testdino.com/blog).

**Canonical source of truth:** [.rules/design_system.md](../../.rules/design_system.md) — always check token values, typography, and page specs there before implementing UI. This skill mirrors the implemented patterns in `src/pages/` and `src/components/`.

**Layout width rule:** All public pages share `--layout-max` (`79.25rem` / 1268px) via `.container`. Post pages use the same outer width; the article template only splits inner space into prose + TOC sidebar.

**Color rule:** Use the warm editorial palette from `.rules/design_system.md` (`--palette-*` and `--color-*` tokens). Do not reintroduce cyan/teal accents.

## 1. Responsive Scroll-to-Hide Header & Mobile Sidebar Drawer
A sticky navigation header that rolls up upwards on scroll down, slide down on scroll up, and exposes a mobile navigation drawer on mobile viewports.

### HTML Structure (React):
```javascript
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Feather, ShieldAlert, LogOut, Menu, X } from 'lucide-react';
import './Header.css';

export const Header = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Scroll direction listener (roll-up effect)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false); // Scrolling down: hide header
      } else {
        setIsVisible(true);  // Scrolling up: show header
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <header className={`header ${isVisible ? '' : 'header--hidden'}`}>
      <div className="container header-nav">
        <Link to="/" className="header-logo" data-testid="nav-link-home">
          <Feather size={20} />
          <span>AuraLog</span>
        </Link>

        {/* Desktop Links (Hidden on mobile) */}
        <div className="header-links desktop-only">
          <Link to="/" className="header-link" data-testid="nav-link-home">Home</Link>
          <Link to="/about" className="header-link" data-testid="nav-link-about">About</Link>
          <Link to="/admin" className="header-link" data-testid="nav-link-admin">Admin</Link>
          <button className="theme-toggle-btn" data-testid="btn-theme-toggle">☀️</button>
        </div>

        {/* Mobile Actions (Visible only on mobile) */}
        <div className="header-mobile-actions mobile-only">
          <button className="theme-toggle-btn">☀️</button>
          <button onClick={() => setIsSidebarOpen(true)} className="mobile-menu-btn" data-testid="btn-mobile-menu">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Sidebar Drawer Panel for Mobile */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`sidebar-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="header-logo" onClick={() => setIsSidebarOpen(false)}>
            <Feather size={20} />
            <span>AuraLog</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="sidebar-close-btn" data-testid="btn-sidebar-close">
            <X size={22} />
          </button>
        </div>
        <nav className="sidebar-links">
          <Link to="/" className="sidebar-link" onClick={() => setIsSidebarOpen(false)} data-testid="sidebar-link-home">Home</Link>
          <Link to="/about" className="sidebar-link" onClick={() => setIsSidebarOpen(false)} data-testid="sidebar-link-about">About</Link>
          <Link to="/admin" className="sidebar-link" onClick={() => setIsSidebarOpen(false)} data-testid="sidebar-link-admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
};
```

### CSS Stylesheet:
```css
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: rgba(9, 9, 11, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
  transition: transform var(--transition-normal), background-color var(--transition-normal);
  transform: translateY(0);
}
.header.header--hidden {
  transform: translateY(-100%);
  box-shadow: none;
}
.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-brand-gradient);
}
:root.light .header {
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 30px rgba(15, 23, 42, 0.04);
}

/* Sidebar Drawer Style */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(9, 9, 11, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
}
.sidebar-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background-color: var(--color-bg-offset);
  border-left: 1px solid var(--color-border);
  z-index: 101;
  padding: 1.5rem;
  transform: translateX(100%);
  transition: transform var(--transition-normal) cubic-bezier(0.16, 1, 0.3, 1);
}
.sidebar-panel.open {
  transform: translateX(0);
}
.mobile-only { display: none !important; }
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: flex !important; }
}
```

---

## 2. Blog Homepage Layout (Featured & Grid)
Divided into: Hero Section -> Featured Post (Horizontal) -> Latest Posts (Grid).

### CSS Layout Grid:
```css
/* Use global container — do not hard-code 1360px or 1200px */
.blog-home-container {
  max-width: var(--layout-max);
  margin: 0 auto;
  padding: 0 var(--layout-gutter);
}

/* Category Slider */
.category-list {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  margin: 2rem 0;
  scrollbar-width: none;
}
.category-list::-webkit-scrollbar {
  display: none;
}
.category-pill {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  background-color: var(--color-tag-bg);
  color: var(--color-tag-text);
  border: 1px solid var(--color-border);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}
.category-pill.active {
  background: var(--color-brand-gradient);
  color: #ffffff;
  border-color: transparent;
}

/* Featured Post Component */
.featured-post-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1rem;
  margin-bottom: 4rem;
  background-color: var(--color-bg-offset);
  text-decoration: none;
  color: inherit;
}
@media (min-width: 768px) {
  .featured-post-card {
    grid-template-columns: 1fr 1fr;
    padding: 1.5rem;
  }
}

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 640px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 3. Blog Article View Layout (Sticky TOC)

Implemented in `src/pages/BlogPost.tsx` + `BlogPost.css`. Reference: [testdino.com/blog/playwright-1-60-release](https://testdino.com/blog/playwright-1-60-release).

Features: hero banner (back link, title, summary, author, cover) → body section (markdown + sticky TOC). **Outer width = `--layout-max`** (same as home/about).

### React Layout Structure:
```javascript
<div className="post-detail-page">
  <section className="post-header-banner">
    <div className="container post-header-banner-container">
      <Link to="/" className="post-back-link" data-testid="link-back-articles">
        <ArrowLeft size={16} /> Back to Blogs
      </Link>

      <div className="post-header-grid">
        <div className="post-header-info">
          {/* optional .post-header-tags */}
          <h1 className="post-header-title">{post.title}</h1>
          <p className="post-header-summary">{post.summary}</p>
          <div className="post-header-author-row">
            <img className="author-avatar" width="48" height="48" … />
            <div className="author-meta">
              <span className="author-name">{author}</span>
              <time className="publish-date">{date}</time>
            </div>
          </div>
        </div>
        <div className="post-header-cover">
          <div className="post-cover-wrapper">
            <img width="563" height="338" fetchPriority="high" … />
          </div>
        </div>
      </div>
    </div>
  </section>

  <section className="post-body-section">
    <div className="container post-body-container">
      <div className="post-content-column">
        <div className="markdown-body">{/* ReactMarkdown */}</div>
        <div className="author-box">…</div>
      </div>
      <aside className="post-sidebar" role="complementary">
        <div className="toc-card">
          <h3 className="toc-title">Table of Contents</h3>
          <div className="toc-scroll">
            <ul className="toc-list">…</ul>
          </div>
        </div>
      </aside>
    </div>
  </section>
</div>
```

### CSS Layout Styles (page-scoped tokens):
```css
.post-detail-page {
  --post-layout-max: var(--layout-max);
  --post-sidebar-width: 18.75rem; /* 300px */
  --post-layout-gap: 3.75rem; /* 60px */
  --post-content-max: calc(var(--post-layout-max) - var(--post-sidebar-width) - var(--post-layout-gap));
}

.post-detail-page .container {
  max-width: var(--post-layout-max);
}

.post-header-banner {
  background-color: var(--color-bg-offset);
  border-bottom: 1px solid var(--color-border);
  padding: 3.75rem 0 2.5rem;
}

@media (min-width: 1024px) {
  .post-header-banner { padding: 5rem 0 3.75rem; }
  .post-header-grid {
    flex-direction: row;
    align-items: center;
    gap: var(--post-layout-gap);
  }
  .post-header-cover {
    flex: 0 0 calc(50% - (var(--post-layout-gap) / 2));
  }
}

.post-header-title {
  font-size: clamp(1.875rem, 4vw, 2.75rem);
  font-weight: 700;
  line-height: 1.15;
}

.post-cover-wrapper {
  aspect-ratio: 563 / 338;
  border-radius: var(--radius-lg);
}

.post-body-section {
  background-color: var(--color-bg);
  padding: 3.75rem 0 6rem;
}

@media (min-width: 1024px) {
  .post-body-container {
    flex-direction: row;
    gap: var(--post-layout-gap);
  }
  .post-content-column {
    flex: 0 1 var(--post-content-max);
    max-width: var(--post-content-max);
  }
  .post-sidebar {
    flex: 0 0 var(--post-sidebar-width);
  }
}

.post-detail-page .markdown-body {
  font-size: 1rem;
  line-height: 1.5;
}

.toc-card {
  position: sticky;
  top: 5.625rem;
  max-height: 31.25rem;
  border-radius: var(--radius-lg);
}

.toc-item.active {
  border-left: 3px solid var(--color-text-highlight);
}
```

**Do not:** narrow post pages to 1125px/1200px containers, put back navigation inside the markdown column, or inline author name · date on the post hero.

---

## 4. Multi-Column Portfolio Footer Layout
A clean three-column grid integrating portfolio description, contact details, site navigation links, and styled circular social redirect icons.

### HTML Structure (React):
```javascript
export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col-brand">
          <div className="footer-logo">AuraLog</div>
          <p className="footer-desc">Sharing thoughts and automation QA guidelines.</p>
          <div className="footer-contact-info">
            <a href="mailto:you@example.com" data-testid="footer-email">you@example.com</a>
            <a href="tel:+10000000000" data-testid="footer-phone">+1 000 000 0000</a>
          </div>
        </div>
        <div className="footer-col-links">
          <h4>Navigation</h4>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </div>
        <div className="footer-col-social">
          <h4>Connect</h4>
          <div className="social-icons">
            <a href="https://github.com/your-username" data-testid="footer-social-github">GitHub</a>
            <a href="https://linkedin.com/in/your-username" data-testid="footer-social-linkedin">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AuraLog. All rights reserved.</p>
      </div>
    </footer>
  );
};
```

### CSS Layout Styles:
```css
.footer {
  background-color: var(--color-bg-offset);
  border-top: 1px solid var(--color-border);
  padding: 4rem 0 2rem 0;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
.footer-contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.footer-contact-info a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.875rem;
}
.footer-contact-info a:hover {
  color: var(--color-primary);
}
.social-icons {
  display: flex;
  gap: 0.75rem;
}
.social-icons a {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.social-icons a:hover {
  transform: translateY(-2px);
  background-color: var(--color-primary);
  border-color: transparent;
  color: #ffffff;
}
.footer-bottom {
  text-align: center;
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
```
