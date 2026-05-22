---
name: image-optimization
description: Standards and markup patterns to optimize image asset delivery, helping the application achieve perfect performance (LCP and CLS).
---

# Image Optimization & Performance (LCP)

This skill guide provides the standards and markup patterns to optimize image asset delivery, helping the application achieve a perfect Lighthouse performance score (specifically targetting LCP and CLS).

**Related:** [.rules/design_system.md](../../.rules/design_system.md) §6.5 (cover dimensions per context).

## 1. Preventing Layout Shift (CLS)
To prevent Cumulative Layout Shift, always specify explicit width and height dimensions on `<img>` tags, or use CSS aspect-ratio properties. This allows the browser to reserve the correct aspect ratio before the image loads.

### Standard HTML Markup:
```html
<img 
  src="/images/hero.webp" 
  width="800" 
  height="450" 
  alt="Blog Hero Image" 
  style="max-width: 100%; height: auto;" 
/>
```

### CSS Aspect Ratio (by context):
```css
/* Featured / card thumbnails */
.post-thumbnail {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-offset);
}

/* Post detail hero cover — BlogPost.css */
.post-cover-wrapper {
  aspect-ratio: 563 / 338;
  border-radius: var(--radius-lg);
}
```

## 2. Using Modern Formats (WebP & AVIF)
Always prefer WebP or AVIF formats over standard PNG/JPEG for blog post content and thumbnails. They offer 30-50% better compression without visible quality degradation.

### Responsive Picture Element Pattern:
If using dynamic sizing, let the browser choose the most lightweight format:
```html
<picture>
  <!-- Serve AVIF if supported -->
  <source srcset="/images/hero.avif" type="image/avif" />
  <!-- Serve WebP as secondary option -->
  <source srcset="/images/hero.webp" type="image/webp" />
  <!-- Fallback to original JPG -->
  <img 
    src="/images/hero.jpg" 
    width="800" 
    height="450" 
    alt="Detailed description of the hero banner" 
    loading="lazy"
  />
</picture>
```

## 3. Lazy Loading Below-the-Fold
Only load images when they enter the user's viewport.
*   **Hero/Above-the-fold Banner**: Do **NOT** lazy load. Set `fetchpriority="high"` to tell the browser to load it immediately.
*   **Below-the-fold Post Thumbnails & Inline Content**: Always set `loading="lazy"`.

### Example (Hero image vs regular images):
```javascript
// Post detail hero (above the fold)
<img
  src={coverUrl}
  alt={post.title}
  fetchPriority="high"
  width="563"
  height="338"
  decoding="async"
/>

// Featured card / feed (below the fold when not LCP)
<img
  src={post.thumbnail_url}
  alt={post.title}
  loading="lazy"
  width="400"
  height="250"
/>
```

## 4. Skeleton Loading Screens
Instead of blank spaces or spinning spinners, use CSS loading skeletons that resemble the final card elements. This gives users a perceived speed boost.

```css
.skeleton-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(
    90deg,
    var(--color-bg-offset) 25%,
    var(--color-bg-highlight) 50%,
    var(--color-bg-offset) 75%
  );
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```
