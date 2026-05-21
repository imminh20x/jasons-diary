import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { getPostBySlug } from '../utils/mockDb';
import { getOptimizedCoverImage } from '../utils/imageUrl';
import { resolvePostCoverImage } from '../utils/generateCoverImage';
import { SITE_AUTHOR } from '../constants/siteAuthor';
import './BlogPost.css';

// Helper function to recursively extract text content from React nodes
const getInnerText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getInnerText).join('');
  if (node.props && node.props.children) return getInnerText(node.props.children);
  return '';
};

// Custom components for ReactMarkdown to inject heading IDs and custom styles
const markdownComponents = {
  h2: ({ ...props }: any) => {
    const childrenText = getInnerText(props.children);
    const id = childrenText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return <h2 id={id} {...props} />;
  },
  h3: ({ ...props }: any) => {
    const childrenText = getInnerText(props.children);
    const id = childrenText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return <h3 id={id} {...props} />;
  },
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string>('');

  const post = useMemo(() => {
    if (!slug) return undefined;
    return getPostBySlug(slug);
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
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!post) {
    return (
      <div className="container container-narrow fade-in" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
        <h2>Post Not Found</h2>
        <p>The article you are looking for might have been removed or updated.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in post-detail-page">
      {/* 1. Full-width Banner Header */}
      <section className="post-header-banner">
        <div className="container post-header-banner-container">
          <div className="post-header-info">
            <div className="post-header-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="post-tag">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="post-header-title">{post.title}</h1>
            <p className="post-header-summary">{post.summary}</p>
            <div className="post-header-author-row">
              <img
                src={SITE_AUTHOR.avatar}
                alt={SITE_AUTHOR.name}
                className="author-avatar"
                width="32"
                height="32"
                decoding="async"
              />
              <div className="author-meta">
                <span className="author-name">{SITE_AUTHOR.name}</span>
                <span className="post-meta-divider">·</span>
                <span className="publish-date">{formatDate(post.publishedAt)}</span>
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
                width="800"
                height="500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Split Body Layout Container */}
      <main className="container post-body-container">
        {/* Left Column: Markdown Article Body */}
        <div className="post-content-column">
          <button onClick={() => navigate(-1)} className="post-back-btn">
            <ArrowLeft size={16} /> Back to Articles
          </button>

          <div className="markdown-body">
            <ReactMarkdown components={markdownComponents}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Author Box */}
          <div className="author-box">
            <img
              src={SITE_AUTHOR.avatar}
              alt={SITE_AUTHOR.name}
              className="author-avatar"
            />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-highlight)' }}>
                Written by {SITE_AUTHOR.name}
              </h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)', opacity: 0.8 }}>
                Technical writer and software engineer focused on designing elegant digital solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Table of Contents Sidebar */}
        <aside className="post-sidebar" role="complementary">
          {headings.length > 0 && (
            <div className="toc-card">
              <h3 className="toc-title">Table of Contents</h3>
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
          )}
        </aside>
      </main>
    </div>
  );
};
