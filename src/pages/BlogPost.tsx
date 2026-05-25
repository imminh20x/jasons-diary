import React, { isValidElement, useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft } from 'lucide-react';
import { getPostBySlug } from '../services/postService';
import type { BlogPost as BlogPostData } from '../types/post';
import { getOptimizedCoverImage } from '../utils/imageUrl';
import { resolvePostCoverImage } from '../utils/generateCoverImage';
import { SITE_AUTHOR } from '../constants/siteAuthor';
import './BlogPost.css';

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

export const BlogPost: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [activeId, setActiveId] = useState<string>('');
  const [post, setPost] = useState<BlogPostData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setPost(undefined);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void getPostBySlug(slug).then((result) => {
      if (!cancelled) {
        setPost(result);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Extract headings from markdown content for the Table of Contents
  const headings = useMemo(() => {
    if (!post) return [];
    const lines = post.content.split('\n');
    const extracted: { id: string; text: string; level: number }[] = [];

    lines.forEach((line) => {
      // Look for h2 (##) or h3 (###)
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[#*`[\]]/g, '').trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        extracted.push({ id, text, level });
      }
    });
    return extracted;
  }, [post]);

  // Highlight active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [headings, post]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // offset for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
    }
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  if (isLoading) {
    return null;
  }

  if (!post) {
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
    <div className="fade-in post-detail-page">
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
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {post.content}
              </ReactMarkdown>
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
            {headings.length > 0 && (
              <div className="toc-card">
                <h3 className="toc-title">{t('post.tableOfContents')}</h3>
                <div className="toc-scroll">
                  <ul className="toc-list">
                    {headings.map((heading) => (
                      <li
                        key={heading.id}
                        onClick={() => scrollToHeading(heading.id)}
                        className={`toc-item toc-item-h${heading.level} ${activeId === heading.id ? 'active' : ''}`}
                      >
                        {heading.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
};
