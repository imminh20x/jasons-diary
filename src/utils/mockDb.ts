export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt: string;
  coverImage: string;
  author: string;
}

const MOCK_DATA_VERSION = '5';

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'Aura Aesthetics: The Power of Minimalist Design',
    slug: 'aura-aesthetics-minimalist-design',
    summary: 'Explore how low-contrast color palettes, glassmorphism, and intentional typography combine to create an immersive, premium user experience.',
    content: `# Aura Aesthetics: The Power of Minimalist Design

Modern web development is shift-focusing from flashing animations and high-contrast color clashes toward something far more refined. We call it **Aura Aesthetics**.

By employing soft, low-contrast grayscale colors combined with vibrant, purposeful accent glows, we construct interfaces that feel less like software and more like physical editorial pieces.

## Why Minimalism Works
Minimalism is not about the lack of content; it is about the *presence of space*. 

1. **Reduced Cognitive Load**: When every element is vying for attention, nothing gets it. Space allows details to breathe.
2. **Glassmorphism**: Backdrop blurs mimic frosted glass, creating an organic layering effect that suggests depth without clutter.
3. **Intentional Typography**: Selecting a single typeface with highly legible weights (like Plus Jakarta Sans) communicates quality and attention to detail.

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

### Implementing Soft Gradients
Soft radial gradients can act as ambient glows beneath translucent panels. For example, applying a glow in CSS:

\`\`\`css
.ambient-glow {
  background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(9, 9, 11, 0) 70%);
}
\`\`\`

## The Grid
Grid layouts should feel architectural. Using a 3-column post grid for desktop views and dropping to 1 or 2 columns on mobile devices ensures readability remains high across all form factors.

Keep reading to see how we implement these details step-by-step in our design systems.`,
    tags: ['Design', 'UX', 'CSS'],
    status: 'published',
    publishedAt: '2026-05-18T10:00:00Z',
    coverImage: '',
    author: 'Jason'
  },
  {
    id: 'post-2',
    title: 'Optimizing React INP (Interaction to Next Paint) in 2026',
    slug: 'optimizing-react-inp-2026',
    summary: 'A deep dive into measuring, isolating, and optimizing INP in React 19 apps using modern scheduler API, transitions, and component optimizations.',
    content: `# Optimizing React INP (Interaction to Next Paint) in 2026

Interaction to Next Paint (INP) is now a core web vital. It measures the latency of all interactions that a user makes with a page, reporting the single worst value.

For React developers, keeping INP under **200 milliseconds** is crucial for maintaining a premium feel.

## Where React Apps Fall Short
React apps typically suffer from high INP due to:
* **Long Tasks**: JavaScript execution blocking the main thread for >50ms.
* **Synchronous State Updates**: Forcing massive component tree re-renders inside click handlers.

## Leveraging React 19 Transitions
With React 19, \`useTransition\` allows us to mark updates as non-blocking. This tells React to yield to the browser if a user interacts with the page during a render.

\`\`\`tsx
const [isPending, startTransition] = useTransition();

const handleClick = () => {
  startTransition(() => {
    // Non-urgent update
    setLargeDataList(newData);
  });
};
\`\`\`

By wrapping complex state updates in a transition, the browser can paint keyframe updates or process click interactions immediately, dramatically lowering INP.`,
    tags: ['React', 'Performance', 'Web Vitals'],
    status: 'published',
    publishedAt: '2026-05-15T14:30:00Z',
    coverImage: '',
    author: 'Jason'
  },
  {
    id: 'post-3',
    title: 'The Rise of CSS-Only Scroll-Driven Animations',
    slug: 'css-only-scroll-driven-animations',
    summary: 'Ditch JavaScript scroll listeners. Learn how to use animation-timeline and view-timeline to create high-performance parallax effects natively.',
    content: `# The Rise of CSS-Only Scroll-Driven Animations

Scroll-driven animations have historically been the domain of complex JavaScript libraries (like GSAP or ScrollMagic). While powerful, these libraries add weight and run on the main thread, risking stuttering frames.

Now, with modern CSS scroll-driven animations, we can bind animations directly to a scroll container natively.

## The Basic Syntax
To link an animation to the scrolling of a page, we use the \`scroll()\` function as the \`animation-timeline\`.

\`\`\`css
@keyframes progress-bar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.scroll-progress {
  animation: progress-bar linear;
  animation-timeline: scroll(root);
}
\`\`\`

## View Timelines
If you want an animation to trigger when a specific element enters the viewport, use \`view-timeline\`:

\`\`\`css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-card {
  animation: fade-in-up linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 30%;
}
\`\`\`

## Performance Benefits
Because these animations are bound natively, browsers can run them on the compositor thread. Even if your main thread is busy executing JavaScript, the scrolling animation remains butter-smooth!`,
    tags: ['CSS', 'Animation', 'Performance'],
    status: 'published',
    publishedAt: '2026-05-12T09:15:00Z',
    coverImage: '',
    author: 'Jason'
  },
  {
    id: 'post-5',
    title: 'Playwright Page Object Model: Patterns That Scale in CI',
    slug: 'playwright-page-object-model-patterns',
    summary: 'How to structure page objects, fixtures, and locators so your Playwright suite stays maintainable as the product grows.',
    content: `# Playwright Page Object Model: Patterns That Scale in CI

A Page Object Model (POM) keeps selectors and page actions in one place. When UI changes, you update a single file instead of dozens of specs.

## Keep Page Objects Thin
Page objects should expose **intent**, not implementation. Prefer \`loginPage.signIn(email, password)\` over chaining ten locators inside every test.

## Use Fixtures for Shared Setup
Playwright fixtures compose better than deep inheritance. Inject \`homePage\`, \`adminPage\`, and authenticated contexts once, reuse everywhere.`,
    tags: ['React', 'Performance'],
    status: 'published',
    publishedAt: '2026-05-10T08:00:00Z',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
    author: 'Jason'
  },
  {
    id: 'post-6',
    title: 'API Testing Checklist for QA Engineers',
    slug: 'api-testing-checklist-qa',
    summary: 'Status codes, schema validation, auth headers, and edge cases — a practical checklist before every release.',
    content: `# API Testing Checklist for QA Engineers

API tests catch regressions faster than UI alone. Start with happy paths, then boundary values, auth failures, and rate limits.

## Must-Have Assertions
- Correct HTTP status and response time
- JSON schema matches contract
- Error payloads are consistent and documented`,
    tags: ['Design', 'UX'],
    status: 'published',
    publishedAt: '2026-05-08T11:30:00Z',
    coverImage: '',
    author: 'Jason'
  },
  {
    id: 'post-7',
    title: 'Using AI Workflows to Speed Up Test Case Design',
    slug: 'ai-workflows-test-case-design',
    summary: 'Pair structured prompts with your product docs to draft test scenarios, then refine with domain knowledge.',
    content: `# Using AI Workflows to Speed Up Test Case Design

AI does not replace QA judgment — it accelerates drafting. Feed acceptance criteria and user flows into a repeatable prompt template.

## What Works Well
- Generating boundary-case ideas from requirements
- Summarizing long specs into test matrices
- Drafting regression suites after bug fixes`,
    tags: ['CSS', 'Animation'],
    status: 'published',
    publishedAt: '2026-05-06T09:45:00Z',
    coverImage: '',
    author: 'Jason'
  },
  {
    id: 'post-8',
    title: 'Building a Reliable E2E Pipeline with GitHub Actions',
    slug: 'e2e-pipeline-github-actions',
    summary: 'Parallel shards, artifact uploads, and flaky-test retries — a CI setup that keeps feedback fast without hiding real failures.',
    content: `# Building a Reliable E2E Pipeline with GitHub Actions

Run Playwright in CI on every pull request. Cache browsers, shard by project, and upload traces on failure.

## Key Practices
- Fail fast on lint and unit tests before E2E
- Store HTML reports and traces as artifacts
- Quarantine consistently flaky specs instead of silent retries`,
    tags: ['React', 'Web Vitals'],
    status: 'published',
    publishedAt: '2026-05-04T16:00:00Z',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
    author: 'Jason'
  },
  {
    id: 'post-9',
    title: 'Finding and Fixing Flaky E2E Tests',
    slug: 'finding-fixing-flaky-e2e-tests',
    summary: 'Race conditions, poor locators, and shared test data are the usual suspects. Here is how to diagnose each one.',
    content: `# Finding and Fixing Flaky E2E Tests

Flaky tests erode trust in CI. Tag unstable specs, run them in isolation, and fix root causes — do not increase retries indefinitely.

## Common Causes
- Waiting for network instead of UI state
- Dynamic IDs and nth-child selectors
- Tests depending on execution order or shared accounts`,
    tags: ['Performance', 'Web Vitals'],
    status: 'published',
    publishedAt: '2026-05-02T10:20:00Z',
    coverImage: '',
    author: 'Jason'
  },
  {
    id: 'post-10',
    title: 'SQL Queries Every QA Engineer Should Know',
    slug: 'sql-queries-qa-engineers',
    summary: 'Verify backend state directly: joins, aggregations, and sanity checks that complement your UI and API tests.',
    content: `# SQL Queries Every QA Engineer Should Know

When UI looks wrong, the database often tells the truth. Learn SELECT with JOIN, COUNT/GROUP BY, and how to spot orphan records.

## Quick Wins
- Compare row counts before and after a workflow
- Validate foreign keys after delete operations
- Snapshot test data fixtures for reproducible bugs`,
    tags: ['Design', 'CSS'],
    status: 'published',
    publishedAt: '2026-04-30T14:00:00Z',
    coverImage: '',
    author: 'Jason'
  },
  {
    id: 'post-11',
    title: 'Manual vs Automated Testing: Choosing the Right Mix',
    slug: 'manual-vs-automated-testing',
    summary: 'Exploratory testing still wins for new features; automation wins for regression. A simple framework to decide per scenario.',
    content: `# Manual vs Automated Testing: Choosing the Right Mix

Automate stable, high-value paths. Keep manual effort for exploratory sessions, usability, and one-off edge cases.

## Rule of Thumb
If a test runs more than three times per sprint and the UI is stable, candidate it for automation. Otherwise, document and move on.`,
    tags: ['UX', 'Design'],
    status: 'published',
    publishedAt: '2026-04-28T08:30:00Z',
    coverImage: '',
    author: 'Jason'
  },
  {
    id: 'post-12',
    title: 'Writing Bug Reports Developers Actually Love',
    slug: 'writing-bug-reports-developers-love',
    summary: 'Repro steps, environment, expected vs actual, and attachments — the template that cuts back-and-forth in half.',
    content: `# Writing Bug Reports Developers Actually Love

A great bug report saves hours. Include minimal repro steps, browser/OS, screenshots or video, and logs when available.

## Template
1. Summary (one line)
2. Steps to reproduce
3. Expected vs actual
4. Severity and frequency`,
    tags: ['CSS', 'Performance'],
    status: 'published',
    publishedAt: '2026-04-25T12:00:00Z',
    coverImage: '',
    author: 'Jason'
  },
  {
    id: 'post-4',
    title: 'Drafting: Next-Gen Edge Frameworks',
    slug: 'drafting-next-gen-edge-frameworks',
    summary: 'An exploration of deployment runtimes, cold starts, and regional data replication across global Vercel/Cloudflare networks.',
    content: `# Drafting: Next-Gen Edge Frameworks

This is a draft post demonstrating how drafts appear only in the Admin Dashboard and not in the public blog feed.

## The Power of Edge
Edge rendering allows server-side HTML to be generated closer to the user, bypassing long round-trip API delays.

* Low latency
* Instant cold starts
* Dynamic geo-routing`,
    tags: ['Edge', 'Architecture'],
    status: 'draft',
    publishedAt: '2026-05-19T11:00:00Z',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
    author: 'Jason'
  }
];

export const getPosts = (): Post[] => {
  const storedVersion = localStorage.getItem('aura_blog_posts_version');
  const posts = localStorage.getItem('aura_blog_posts');

  if (!posts || storedVersion !== MOCK_DATA_VERSION) {
    localStorage.setItem('aura_blog_posts', JSON.stringify(INITIAL_POSTS));
    localStorage.setItem('aura_blog_posts_version', MOCK_DATA_VERSION);
    return INITIAL_POSTS;
  }

  try {
    return JSON.parse(posts);
  } catch {
    localStorage.setItem('aura_blog_posts', JSON.stringify(INITIAL_POSTS));
    localStorage.setItem('aura_blog_posts_version', MOCK_DATA_VERSION);
    return INITIAL_POSTS;
  }
};

export const getPostBySlug = (slug: string): Post | undefined => {
  const posts = getPosts();
  return posts.find((p) => p.slug === slug);
};

export const getPostById = (id: string): Post | undefined => {
  const posts = getPosts();
  return posts.find((p) => p.id === id);
};

export const savePost = (post: Omit<Post, 'id' | 'publishedAt'> & { id?: string }): Post => {
  const posts = getPosts();
  const existingIndex = post.id ? posts.findIndex((p) => p.id === post.id) : -1;

  let savedPost: Post;

  if (existingIndex > -1 && post.id) {
    savedPost = {
      ...posts[existingIndex],
      ...post,
      publishedAt: post.status === 'published' && posts[existingIndex].status === 'draft'
        ? new Date().toISOString()
        : posts[existingIndex].publishedAt
    } as Post;
    posts[existingIndex] = savedPost;
  } else {
    savedPost = {
      ...post,
      id: post.id || `post-${Date.now()}`,
      publishedAt: post.status === 'published' ? new Date().toISOString() : new Date().toISOString(),
    } as Post;
    posts.push(savedPost);
  }

  localStorage.setItem('aura_blog_posts', JSON.stringify(posts));
  return savedPost;
};

export const deletePost = (id: string): void => {
  const posts = getPosts();
  const filtered = posts.filter((p) => p.id !== id);
  localStorage.setItem('aura_blog_posts', JSON.stringify(filtered));
};
