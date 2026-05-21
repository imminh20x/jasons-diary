import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Save, Eye, Edit, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPostById, savePost } from '../utils/mockDb';
import { SITE_AUTHOR } from '../constants/siteAuthor';
import { isAdminAuthenticated } from '../utils/adminAuth';
import { resolvePostCoverImage } from '../utils/generateCoverImage';
import { registerPostTags } from '../utils/postTags';
import { PostTagsInput } from '../components/PostTagsInput';
import './AdminEditor.css';

export const AdminEditor: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const post = useMemo(() => {
    return id ? getPostById(id) : undefined;
  }, [id]);

  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [summary, setSummary] = useState(post?.summary || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags || []);
  const [content, setContent] = useState(post?.content || '');
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');

  const [isSlugManual, setIsSlugManual] = useState(!!post);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isEditing] = useState(!!post);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAdminAuthenticated(user)) {
      navigate('/login');
      return;
    }

    if (id && !post) {
      navigate('/admin');
    }
  }, [id, loading, navigate, post, user]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugManual) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setIsSlugManual(true);
    setSlug(newSlug.toLowerCase().replace(/\s+/g, '-'));
  };

  const parsedTags = selectedTags;

  const previewCoverImage = useMemo(() => {
    return resolvePostCoverImage(coverImage, title);
  }, [coverImage, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !slug.trim()) {
      alert(t('editor.requiredAlert'));
      return;
    }

    const finalCover = resolvePostCoverImage(coverImage, title.trim());

    if (parsedTags.length > 0) {
      await registerPostTags(parsedTags);
    }

    savePost({
      id,
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim() || 'No summary provided.',
      tags: parsedTags,
      content: content,
      status,
      coverImage: finalCover,
      author: SITE_AUTHOR.name,
    });

    navigate('/admin');
  };

  const hasPreviewContent = Boolean(title || content || summary);

  return (
    <div className="container editor-page fade-in">
      <nav className="editor-breadcrumb" aria-label="Breadcrumb">
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="post-back-btn"
          data-testid="btn-post-back"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('editor.backToDashboard')}
        </button>
     
      </nav>

      <header className="editor-page-header">
        <div className="editor-page-header-text">
          <h1>{isEditing ? t('editor.editArticle') : t('editor.createArticle')}</h1>
          <p className="editor-page-subtitle">
            {isEditing ? t('editor.pageSubtitleEdit') : t('editor.pageSubtitleCreate')}
          </p>
        </div>

        <div className="editor-page-actions">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
            data-testid="btn-post-cancel"
          >
            {t('editor.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
            data-testid="btn-post-publish"
          >
            <Save size={16} aria-hidden="true" />
            {t('editor.savePost')}
          </button>
        </div>
      </header>

      <div className="mobile-tabs-container" role="tablist" aria-label={t('editor.livePreview')}>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'edit'}
          onClick={() => setMobileTab('edit')}
          className={`mobile-tab-btn ${mobileTab === 'edit' ? 'active' : ''}`}
        >
          <Edit size={14} aria-hidden="true" />
          {t('editor.edit')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'preview'}
          onClick={() => setMobileTab('preview')}
          className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
        >
          <Eye size={14} aria-hidden="true" />
          {t('editor.livePreview')}
        </button>
      </div>

      <div className="editor-container">
        <div className={`editor-pane ${mobileTab !== 'edit' ? 'pane-hidden-mobile' : ''}`}>
          <form className="editor-form" onSubmit={handleSubmit}>
            <section className="editor-form-section" aria-labelledby="editor-section-basics">
              <h2 id="editor-section-basics" className="editor-section-title">
                {t('editor.sectionBasics')}
              </h2>

              <div className="form-group">
                <label className="form-label" htmlFor="post-title">
                  {t('editor.title')}
                </label>
                <input
                  id="post-title"
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={t('editor.titlePlaceholder')}
                  className="form-input"
                  data-testid="input-post-title"
                  required
                />
              </div>

              <div className="editor-form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="post-slug">
                    {t('editor.slug')}
                  </label>
                  <input
                    id="post-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder={t('editor.slugPlaceholder')}
                    className="form-input"
                    required
                  />
                  <p className="slug-preview">
                    {t('editor.slugPreview')} <strong>/post/{slug || 'your-slug-here'}</strong>
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="post-status">
                    {t('editor.status')}
                  </label>
                  <div className="editor-select-wrap">
                    <select
                      id="post-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                      className="form-select"
                    >
                      <option value="draft">{t('editor.draft')}</option>
                      <option value="published">{t('editor.published')}</option>
                    </select>
                    <ChevronDown size={18} className="editor-select-icon" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </section>

            <section className="editor-form-section" aria-labelledby="editor-section-media">
              <h2 id="editor-section-media" className="editor-section-title">
                {t('editor.sectionMedia')}
              </h2>

              <div className="form-group">
                <label className="form-label" htmlFor="post-cover">
                  {t('editor.coverImage')}
                </label>
                <input
                  id="post-cover"
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder={t('editor.coverPlaceholder')}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="post-tags">
                  {t('editor.tags')}
                </label>
                <PostTagsInput
                  id="post-tags"
                  value={selectedTags}
                  onChange={setSelectedTags}
                />
              </div>
            </section>

            <section className="editor-form-section" aria-labelledby="editor-section-content">
              <h2 id="editor-section-content" className="editor-section-title">
                {t('editor.sectionContent')}
              </h2>

              <div className="form-group">
                <label className="form-label" htmlFor="post-summary">
                  {t('editor.summary')}
                </label>
                <textarea
                  id="post-summary"
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={t('editor.summaryPlaceholder')}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="post-content">
                  {t('editor.content')}
                </label>
                <textarea
                  id="post-content"
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('editor.contentPlaceholder')}
                  className="form-textarea editor-content-textarea"
                  data-testid="textarea-post-content"
                  required
                />
              </div>
            </section>
          </form>
        </div>

        <aside className={`preview-pane ${mobileTab !== 'preview' ? 'pane-hidden-mobile' : ''}`}>
          <h2 className="preview-pane-header">
            <Eye size={14} aria-hidden="true" />
            {t('editor.previewHeading')}
          </h2>

          {!hasPreviewContent ? (
            <div className="preview-empty-state">
              <HelpCircle size={40} aria-hidden="true" />
              <h4>{t('editor.previewEmptyTitle')}</h4>
              <p>{t('editor.previewEmptyDesc')}</p>
            </div>
          ) : (
            <article>
              <div className="preview-cover">
                <img
                  src={previewCoverImage}
                  alt={t('editor.coverPreviewAlt')}
                />
              </div>

              {parsedTags.length > 0 && (
                <div className="preview-tags">
                  {parsedTags.map((tag) => (
                    <span key={tag} className="post-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="preview-title">{title || t('editor.untitled')}</h1>

              <div className="preview-meta">
                <span>{t('editor.by')} {SITE_AUTHOR.name}</span>
                <span aria-hidden="true">•</span>
                <span>{t('editor.justNow')}</span>
              </div>

              {summary && <p className="preview-summary">{summary}</p>}

              <div className="markdown-body">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </article>
          )}
        </aside>
      </div>
    </div>
  );
};
