import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Save, Eye, Edit, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPostById, savePost } from '../utils/mockDb';
import { SITE_AUTHOR } from '../constants/siteAuthor';
import { isAdminAuthenticated } from '../utils/adminAuth';
import './AdminEditor.css';

export const AdminEditor: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load post details if editing
  const post = useMemo(() => {
    return id ? getPostById(id) : undefined;
  }, [id]);

  // Form states
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [summary, setSummary] = useState(post?.summary || '');
  const [tagsInput, setTagsInput] = useState(post?.tags.join(', ') || '');
  const [content, setContent] = useState(post?.content || '');
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');

  // Helper flags
  const [isSlugManual, setIsSlugManual] = useState(!!post);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isEditing] = useState(!!post);

  // Auth Guard
  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAdminAuthenticated(user)) {
      navigate('/login');
      return;
    }

    if (id && !post) {
      // ID provided but post not found
      navigate('/admin');
    }
  }, [id, loading, navigate, post, user]);

  // Slug auto-generation logic
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

  // Convert comma separated tags to array
  const parsedTags = useMemo(() => {
    return tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }, [tagsInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !slug.trim()) {
      alert(t('editor.requiredAlert'));
      return;
    }

    // Default cover image if empty
    const finalCover = coverImage.trim() || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000';

    savePost({
      id,
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim() || 'No summary provided.',
      tags: parsedTags.length > 0 ? parsedTags : ['General'],
      content: content,
      status,
      coverImage: finalCover,
      author: SITE_AUTHOR.name,
    });

    navigate('/admin');
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: '5rem' }}>
      <div className="editor-header">
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="post-back-btn"
            style={{ margin: 0 }}
            data-testid="btn-post-cancel"
          >
            <ArrowLeft size={16} /> {t('editor.backToDashboard')}
          </button>
          <h1 style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            {isEditing ? t('editor.editArticle') : t('editor.createArticle')}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
            data-testid="btn-post-cancel"
          >
            {t('editor.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            data-testid="btn-post-publish"
          >
            <Save size={16} /> {t('editor.savePost')}
          </button>
        </div>
      </div>

      {/* Tab toggle for mobile layouts */}
      <div className="mobile-tabs-container">
        <button
          onClick={() => setMobileTab('edit')}
          className={`mobile-tab-btn ${mobileTab === 'edit' ? 'active' : ''}`}
        >
          <Edit size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          {t('editor.edit')}
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
        >
          <Eye size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          {t('editor.livePreview')}
        </button>
      </div>

      <div className="editor-container">
        {/* Editor Form Column */}
        <div className={`editor-pane ${mobileTab !== 'edit' ? 'pane-hidden-mobile' : ''}`}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
              <span className="slug-preview">
                {t('editor.slugPreview')} <strong>/post/{slug || 'your-slug-here'}</strong>
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="post-status">
                {t('editor.status')}
              </label>
              <select
                id="post-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="form-select"
              >
                <option value="draft">{t('editor.draft')}</option>
                <option value="published">{t('editor.published')}</option>
              </select>
            </div>

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
              <input
                id="post-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={t('editor.tagsPlaceholder')}
                className="form-input"
                data-testid="input-post-tags"
              />
            </div>

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
                style={{ resize: 'vertical' }}
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
                className="form-textarea"
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.875rem' }}
                data-testid="textarea-post-content"
                required
              />
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className={`preview-pane ${mobileTab !== 'preview' ? 'pane-hidden-mobile' : ''}`}>
          <h2 style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Eye size={14} /> {t('editor.previewHeading')}
          </h2>

          {!title && !content && !summary ? (
            <div className="preview-empty-state">
              <HelpCircle size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h4>{t('editor.previewEmptyTitle')}</h4>
              <p>{t('editor.previewEmptyDesc')}</p>
            </div>
          ) : (
            <div>
              {coverImage && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem', maxHeight: '200px', border: '1px solid var(--color-border)' }}>
                  <img
                    src={coverImage}
                    alt={t('editor.coverPreviewAlt')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000';
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {parsedTags.map((tag) => (
                  <span key={tag} className="post-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem', color: 'var(--color-text-highlight)' }}>
                {title || t('editor.untitled')}
              </h1>

              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                <span>{t('editor.by')} {SITE_AUTHOR.name}</span>
                <span>•</span>
                <span>{t('editor.justNow')}</span>
              </div>

              {summary && (
                <div style={{ fontStyle: 'italic', borderLeft: '3px solid var(--color-border)', paddingLeft: '1rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                  {summary}
                </div>
              )}

              <div className="markdown-body">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
