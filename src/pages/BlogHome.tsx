import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ArrowRight, BookOpen } from 'lucide-react';
import { getPosts } from '../utils/mockDb';
import { getOptimizedCoverImage } from '../utils/imageUrl';
import { resolvePostCoverImage } from '../utils/generateCoverImage';
import './BlogHome.css';

const ALL_TAGS = 'all';

export const BlogHome: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(ALL_TAGS);

  // Load posts (only published ones for public view)
  const publishedPosts = useMemo(() => {
    return getPosts().filter((post) => post.status === 'published');
  }, []);

  // Dynamically extract all available tags from published posts
  const tags = useMemo(() => {
    const allTags = new Set<string>();
    publishedPosts.forEach((post) => {
      post.tags.forEach((tag) => allTags.add(tag));
    });
    return [ALL_TAGS, ...Array.from(allTags)];
  }, [publishedPosts]);

  const isAllTags = selectedTag === ALL_TAGS;

  // Filter and sort posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    const filtered = publishedPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = isAllTags || post.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });

    return filtered.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [publishedPosts, searchQuery, selectedTag, isAllTags]);

  // Sort all published posts
  const sortedPosts = useMemo(() => {
    return [...publishedPosts].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }, [publishedPosts]);

  const isFiltered = searchQuery || !isAllTags;

  // Extract featured, latest, and more posts dynamically
  const featuredPost = useMemo(() => {
    if (isFiltered || sortedPosts.length === 0) return null;
    return sortedPosts[0];
  }, [sortedPosts, isFiltered]);

  const latestPosts = useMemo(() => {
    if (isFiltered) return [];
    return sortedPosts.slice(1, 3);
  }, [sortedPosts, isFiltered]);

  const morePosts = useMemo(() => {
    if (isFiltered) return filteredPosts;
    return sortedPosts.slice(3);
  }, [sortedPosts, filteredPosts, isFiltered]);

  const formatDate = (dateString: string) => {
    const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  const getTagLabel = (tag: string) => (tag === ALL_TAGS ? t('home.allTags') : tag);

  return (
    <div className="fade-in home-wrapper">
      {/* Hero Banner Section */}
      <section className="home-hero">
        <div className="ambient-glow" />
        <div className="container">
          <div className="home-hero-inner">
            <h1 className="home-title">{t('header.logo')}</h1>
            <p className="home-subtitle">
              {t('header.subtitle')}
            </p>

            {/* Categories Pills */}
            <div className="category-pills-container" role="tablist" aria-label={t('home.filterAriaLabel')}>
              {tags.map((tag) => (
                <button
                  key={tag}
                  role="tab"
                  aria-selected={selectedTag === tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`category-pill ${selectedTag === tag ? 'active' : ''}`}
                  data-testid={tag === ALL_TAGS ? 'category-pill-all' : `category-pill-${tag.toLowerCase()}`}
                >
                  {getTagLabel(tag)}
                </button>
              ))}
            </div>

            {/* Centered Search Bar */}
            <div className="search-wrapper">
              <form role="search" onSubmit={(e) => e.preventDefault()} className="search-form">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  data-testid="input-search"
                  aria-label={t('home.searchAriaLabel')}
                />
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container">
        {/* Case: Filters Active */}
        {isFiltered ? (
          <div>
            <div className="section-divider">
              <span className="section-eyebrow">{t('home.results', { count: filteredPosts.length })}</span>
              <div className="divider-line" />
            </div>

            {filteredPosts.length === 0 ? (
              <div className="empty-state">
                <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>{t('home.emptyTitle')}</h3>
                <p>{t('home.emptyDesc')}</p>
              </div>
            ) : (
              <div className="more-grid" data-testid="blog-posts-list">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="card more-card" data-testid={`card-post-${post.id}`}>
                    <div className="more-img-wrapper">
                      <Link to={`/post/${post.slug}`}>
                        <img
                          src={getOptimizedCoverImage(resolvePostCoverImage(post.coverImage, post.title), 400)}
                          alt={post.title}
                          loading="lazy"
                          decoding="async"
                          width="400"
                          height="250"
                        />
                      </Link>
                    </div>
                    <div className="more-content">
                      <div className="card-tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className="tag-pill">{tag}</span>
                        ))}
                      </div>
                      <h5 className="card-title more-title">
                        <Link to={`/post/${post.slug}`}>{post.title}</Link>
                      </h5>
                      <div className="more-footer">
                        <span className="publish-date">{formatDate(post.publishedAt)}</span>
                        <Link
                          to={`/post/${post.slug}`}
                          className="read-more-link"
                          data-testid={`link-read-more-${post.id}`}
                        >
                          {t('home.readArticle')} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Case: Default Home Layout */
          <div>
            {/* 1. Featured Post */}
            {featuredPost && (
              <div className="featured-section">
                <div className="card featured-card" data-testid={`card-post-${featuredPost.id}`}>
                  <div className="featured-img-wrapper">
                    <Link to={`/post/${featuredPost.slug}`}>
                      <img
                        src={getOptimizedCoverImage(resolvePostCoverImage(featuredPost.coverImage, featuredPost.title), 800)}
                        alt={featuredPost.title}
                        fetchPriority="high"
                        decoding="async"
                        width="800"
                        height="500"
                      />
                    </Link>
                  </div>
                  <div className="featured-content">
                    <span className="text-eyebrow uppercase">{t('home.featured')}</span>
                    <h5 className="card-title featured-title">
                      <Link to={`/post/${featuredPost.slug}`}>{featuredPost.title}</Link>
                    </h5>
                    <p className="featured-summary">{featuredPost.summary}</p>
                    <div className="featured-footer">
                      <div className="featured-author-row">
                        <div className="author-meta">
                          <span className="publish-date">{formatDate(featuredPost.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Container for list grid locator compatibility */}
            <div data-testid="blog-posts-list">
              {/* 2. Latest Section (2 Columns) */}
              {latestPosts.length > 0 && (
                <div className="latest-section">
                  <div className="section-divider">
                    <span className="section-eyebrow uppercase">{t('home.latest')}</span>
                    <div className="divider-line" />
                  </div>
                  <div className="latest-grid">
                    {latestPosts.map((post) => (
                      <article key={post.id} className="card latest-card" data-testid={`card-post-${post.id}`}>
                        <div className="latest-img-wrapper">
                          <Link to={`/post/${post.slug}`}>
                            <img
                              src={getOptimizedCoverImage(resolvePostCoverImage(post.coverImage, post.title), 640)}
                              alt={post.title}
                              width="640"
                              height="400"
                              loading="lazy"
                              decoding="async"
                            />
                          </Link>
                        </div>
                        <div className="latest-content">
                          <div className="card-tags">
                            {post.tags.map((tag) => (
                              <span key={tag} className="tag-pill">{tag}</span>
                            ))}
                          </div>
                          <h5 className="card-title latest-title">
                            <Link to={`/post/${post.slug}`}>{post.title}</Link>
                          </h5>
                          <p className="latest-summary">{post.summary}</p>
                          <div className="latest-author-row">
                            <div className="author-meta flex-1">
                              <span className="publish-date">{formatDate(post.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. More Articles Section (3 Columns) */}
              {morePosts.length > 0 && (
                <div className="more-section">
                  <div className="section-divider">
                    <span className="section-eyebrow uppercase">{t('home.moreArticles')}</span>
                    <div className="divider-line" />
                  </div>
                  <div className="more-grid">
                    {morePosts.map((post) => (
                      <article key={post.id} className="card more-card" data-testid={`card-post-${post.id}`}>
                        <div className="more-img-wrapper">
                          <Link to={`/post/${post.slug}`}>
                            <img
                              src={getOptimizedCoverImage(resolvePostCoverImage(post.coverImage, post.title), 400)}
                              alt={post.title}
                              width="400"
                              height="250"
                              loading="lazy"
                              decoding="async"
                            />
                          </Link>
                        </div>
                        <div className="more-content">
                          <div className="card-tags">
                            {post.tags.map((tag) => (
                              <span key={tag} className="tag-pill">{tag}</span>
                            ))}
                          </div>
                          <h5 className="card-title more-title">
                            <Link to={`/post/${post.slug}`}>{post.title}</Link>
                          </h5>
                          <div className="more-footer">
                            <span className="publish-date">{formatDate(post.publishedAt)}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
