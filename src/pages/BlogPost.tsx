import React, { isValidElement, memo, useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';
import { getCachedPostBySlug, getPostBySlug } from '../services/postService';
import type { BlogPost as BlogPostData } from '../types/post';
import { getOptimizedCoverImage } from '../utils/imageUrl';
import { resolvePostCoverImage } from '../utils/generateCoverImage';
import { SITE_AUTHOR } from '../constants/siteAuthor';
import './BlogPost.css';

type TocHeading = { id: string; text: string; level: number };

// Helper function to recursively extract text content from React nodes
const getInnerText = (node: React.ReactNode): string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getInnerText).join('');
  if (isValidElement<{ children?: React.ReactNode }>(node)) {
    return getInnerText(node.props.children);
  }
  return '';
};

// Custom components for ReactMarkdown to inject heading IDs and custom styles
const markdownComponents = {
  h2: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const childrenText = getInnerText(props.children);
    const id = childrenText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return <h2 id={id} {...props} />;
  },
  h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const childrenText = getInnerText(props.children);
    const id = childrenText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return <h3 id={id} {...props} />;
  },
};

const PostMarkdown = memo(function PostMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
});

const scrollTocItemIntoView = (container: HTMLElement, item: HTMLElement): void => {
  const padding = 12;
  const containerRect = container.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();

  const isFullyVisible =
    itemRect.top >= containerRect.top + padding &&
    itemRect.bottom <= containerRect.bottom - padding;

  if (isFullyVisible) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  if (itemRect.top < containerRect.top + padding) {
    container.scrollBy({ top: itemRect.top - containerRect.top - padding, behavior });
    return;
  }

  container.scrollBy({ top: itemRect.bottom - containerRect.bottom + padding, behavior });
};

const TableOfContents = memo(function TableOfContents({
  headings,
  activeId,
  title,
  onSelect,
}: {
  headings: TocHeading[];
  activeId: string;
  title: string;
  onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId || !scrollRef.current) {
      return;
    }

    const activeItem = scrollRef.current.querySelector<HTMLElement>(`[data-toc-id="${activeId}"]`);
    if (!activeItem) {
      return;
    }

    scrollTocItemIntoView(scrollRef.current, activeItem);
  }, [activeId, headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="toc-card">
      <h3 className="toc-title">{title}</h3>
      <div className="toc-scroll" ref={scrollRef}>
        <ul className="toc-list">
          {headings.map((heading) => (
            <li
              key={heading.id}
              data-toc-id={heading.id}
              onClick={() => onSelect(heading.id)}
              className={`toc-item toc-item-h${heading.level} ${activeId === heading.id ? 'active' : ''}`}
              aria-current={activeId === heading.id ? 'location' : undefined}
            >
              {heading.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const PostDetailSkeleton = () => (
  <div className="post-detail-page post-detail-page--loading" aria-busy="true" aria-label="Loading post">
    <section className="post-header-banner">
      <div className="container post-header-banner-container">
        <div className="post-header-grid">
          <div className="post-header-info">
            <div className="post-skeleton post-skeleton-line post-skeleton-line--sm" />
            <div className="post-skeleton post-skeleton-line post-skeleton-line--title" />
            <div className="post-skeleton post-skeleton-line post-skeleton-line--summary" />
            <div className="post-skeleton post-skeleton-line post-skeleton-line--summary post-skeleton-line--short" />
            <div className="post-skeleton post-skeleton-author" />
          </div>
          <div className="post-header-cover">
            <div className="post-skeleton post-skeleton-cover" />
          </div>
        </div>
      </div>
    </section>
    <section className="post-body-section">
      <div className="container post-body-container">
        <div className="post-content-column">
          <div className="post-skeleton post-skeleton-line" />
          <div className="post-skeleton post-skeleton-line" />
          <div className="post-skeleton post-skeleton-line post-skeleton-line--short" />
        </div>
      </div>
    </section>
  </div>
);

const extractHeadings = (content: string): TocHeading[] => {
  const lines = content.split('\n');
  const extracted: TocHeading[] = [];

  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[#*`[\]]/g, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      extracted.push({ id, text, level });
    }
  });

  return extracted;
};

export const BlogPost: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [activeId, setActiveId] = useState<string>('');
  const [fetchedPost, setFetchedPost] = useState<BlogPostData | undefined>();
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);

  const cachedPost = slug ? getCachedPostBySlug(slug) : undefined;
  const post =
    cachedPost ?? (fetchedPost?.slug === slug ? fetchedPost : undefined);
  const isLoading = Boolean(slug) && !post && resolvedSlug !== slug;

  useEffect(() => {
    if (!slug || getCachedPostBySlug(slug)) {
      return;
    }

    let cancelled = false;

    void getPostBySlug(slug).then((result) => {
      if (!cancelled) {
        setFetchedPost(result);
        setResolvedSlug(slug);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const headings = useMemo(() => (post ? extractHeadings(post.content) : []), [post]);

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const scrollOffset = 100;

    const updateActiveHeading = () => {
      let currentId = headings[0]?.id ?? '';

      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (!el) {
          continue;
        }

        if (el.getBoundingClientRect().top <= scrollOffset) {
          currentId = heading.id;
        } else {
          break;
        }
      }

      setActiveId((previous) => (previous === currentId ? previous : currentId));
    };

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('resize', updateActiveHeading);

    return () => {
      window.removeEventListener('scroll', updateActiveHeading);
      window.removeEventListener('resize', updateActiveHeading);
    };
  }, [headings]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    const offset = 90;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
    setActiveId(id);
  }, []);

  const formatDate = (dateString: string) => {
    const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (!slug || !post) {
    return (
      <div className="container container-narrow fade-in" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
        <h2>{t('post.notFoundTitle')}</h2>
        <p>{t('post.notFoundDesc')}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          {t('post.backToHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <section className="post-header-banner">
        <div className="container post-header-banner-container">
          <div className="post-header-grid">
            <div className="post-header-info">
              <Link to="/" className="post-back-link" data-testid="link-back-articles">
                <ArrowLeft size={16} aria-hidden="true" />
                {t('post.backToArticles')}
              </Link>
              <h1 className="post-header-title">{post.title}</h1>
              <p className="post-header-summary">{post.summary}</p>
              <div className="post-header-author-row">
                <img
                  src={SITE_AUTHOR.avatar}
                  alt={SITE_AUTHOR.name}
                  className="author-avatar"
                  width="56"
                  height="56"
                  decoding="async"
                />
                <div className="author-meta">
                  <span className="author-name">{SITE_AUTHOR.name}</span>
                  <time className="publish-date" dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
              </div>
            </div>

            <div className="post-header-cover">
              <div className="post-cover-wrapper">
                <img
                  src={getOptimizedCoverImage(resolvePostCoverImage(post.coverImage, post.title), 800)}
                  alt={post.title}
                  fetchPriority="high"
                  decoding="async"
                  width="563"
                  height="338"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="post-body-section">
        <div className="container post-body-container">
          <div className="post-content-column">
            <div className="markdown-body">
              <PostMarkdown content={post.content} />
            </div>

            <div className="author-box">
              <img
                src={SITE_AUTHOR.avatar}
                alt={SITE_AUTHOR.name}
                className="author-avatar"
              />
              <div>
                <h4 className="author-box-title">{t('post.writtenBy', { name: SITE_AUTHOR.name })}</h4>
                <p className="author-box-bio">
                  {t('post.authorBio')}
                </p>
              </div>
            </div>
          </div>

          <aside className="post-sidebar" role="complementary">
            <TableOfContents
              headings={headings}
              activeId={activeId}
              title={t('post.tableOfContents')}
              onSelect={scrollToHeading}
            />
          </aside>
        </div>
      </section>
    </div>
  );
};
