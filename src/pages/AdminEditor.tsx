import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { ArrowLeft, Save, Eye, Edit, HelpCircle, ChevronDown, ImagePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPostById, savePost } from '../services/postService';
import type { BlogPost } from '../types/post';
import { SITE_AUTHOR } from '../constants/siteAuthor';
import { isAdminAuthenticated } from '../utils/adminAuth';
import { resolvePostCoverImage } from '../utils/generateCoverImage';
import { registerPostTags } from '../utils/postTags';
import { uploadImage } from '../services/db';
import { compressImage } from '../utils/imageUrl';
import { PostTagsInput } from '../components/PostTagsInput';
import './AdminEditor.css';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

const imageAltFromFile = (fileName: string): string => {
  const baseName = fileName.replace(/\.[^.]+$/, '').trim();
  return baseName.replace(/[-_]+/g, ' ').trim();
};

export const AdminEditor: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loadedPost, setLoadedPost] = useState<BlogPost | undefined>(undefined);
  const [isPostLoading, setIsPostLoading] = useState(Boolean(id));

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [coverImage, setCoverImage] = useState('');

  const [isSlugManual, setIsSlugManual] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isEditing] = useState(Boolean(id));
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    void getPostById(id).then((result) => {
      if (cancelled) {
        return;
      }

      if (result) {
        setTitle(result.title);
        setSlug(result.slug);
        setSummary(result.summary);
        setSelectedTags(result.tags);
        setContent(result.content);
        setStatus(result.status);
        setCoverImage(result.coverImage);
        setIsSlugManual(true);
        setLoadedPost(result);
      } else {
        setLoadedPost(undefined);
      }

      setIsPostLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAdminAuthenticated(user)) {
      navigate('/login');
      return;
    }

    if (id && !isPostLoading && !loadedPost) {
      navigate('/admin');
    }
  }, [id, isPostLoading, loadedPost, loading, navigate, user]);

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

  const insertMarkdownImage = (url: string, alt: string) => {
    const textarea = contentTextareaRef.current;
    const snippet = `\n![${alt}](${url})\n`;

    if (!textarea) {
      setContent((prev) => `${prev}${snippet}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setContent((prev) => `${prev.slice(0, start)}${snippet}${prev.slice(end)}`);

    const cursor = start + snippet.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleImageUpload = async (file: File, target: 'cover' | 'content') => {
    setUploadError('');

    if (target === 'cover') {
      setIsUploadingCover(true);
    } else {
      setIsUploadingContent(true);
    }

    try {
      const maxWidth = target === 'cover' ? 1200 : 1000;
      const maxHeight = target === 'cover' ? 1200 : 1000;
      const optimizedFile = await compressImage(file, maxWidth, maxHeight, 0.85);

      const { data, error } = await uploadImage(optimizedFile);

      if (error || !data?.url) {
        setUploadError(error?.message ?? t('editor.uploadFailed'));
        return;
      }

      if (target === 'cover') {
        setCoverImage(data.url);
        return;
      }

      const alt = imageAltFromFile(file.name) || t('editor.imageAltFallback');
      insertMarkdownImage(data.url, alt);
    } catch {
      setUploadError(t('editor.uploadFailed'));
    } finally {
      if (target === 'cover') {
        setIsUploadingCover(false);
      } else {
        setIsUploadingContent(false);
      }
    }
  };

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    void handleImageUpload(file, 'cover');
  };

  const handleContentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    void handleContentImagesUpload(files);
  };

  const handleContentImagesUpload = async (files: File[]) => {
    setUploadError('');
    setIsUploadingContent(true);

    const textarea = contentTextareaRef.current;
    const insertAt = textarea?.selectionStart ?? content.length;
    const insertEnd = textarea?.selectionEnd ?? content.length;
    const snippets: string[] = [];

    try {
      for (const file of files) {
        const optimizedFile = await compressImage(file, 1000, 1000, 0.85);
        const { data, error } = await uploadImage(optimizedFile);

        if (error || !data?.url) {
          setUploadError(error?.message ?? t('editor.uploadFailed'));
          break;
        }

        const alt = imageAltFromFile(file.name) || t('editor.imageAltFallback');
        snippets.push(`\n![${alt}](${data.url})\n`);
      }

      if (snippets.length === 0) {
        return;
      }

      const block = snippets.join('');
      setContent((prev) => `${prev.slice(0, insertAt)}${block}${prev.slice(insertEnd)}`);

      const cursor = insertAt + block.length;
      requestAnimationFrame(() => {
        textarea?.focus();
        textarea?.setSelectionRange(cursor, cursor);
      });
    } catch {
      setUploadError(t('editor.uploadFailed'));
    } finally {
      setIsUploadingContent(false);
    }
  };

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

    const saved = await savePost({
      id,
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim() || t('editor.noSummary'),
      tags: parsedTags,
      content: content,
      status,
      coverImage: finalCover,
      author: SITE_AUTHOR.name,
    });

    if (!saved) {
      alert(t('editor.saveFailed'));
      return;
    }

    navigate('/admin');
  };

  const hasPreviewContent = Boolean(title || content || summary);

  if (isPostLoading) {
    return null;
  }

  return (
    <div className="container admin-page editor-page fade-in">
        <div
          onClick={() => navigate('/admin')}
          className="post-back-link"
          data-testid="editor-back-link"
        >
           <ArrowLeft size={16} aria-hidden="true" />
          {t('editor.backToDashboard')}
        </div>

      <header className="editor-page-header">
        <div className="editor-page-header-text">
          <h1 className="page-title">{isEditing ? t('editor.editArticle') : t('editor.createArticle')}</h1>
          <p className="page-subtitle">
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
                <div className="editor-image-field">
                  <input
                    id="post-cover"
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder={t('editor.coverPlaceholder')}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary editor-upload-btn"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                    data-testid="btn-upload-cover"
                  >
                    <ImagePlus size={16} aria-hidden="true" />
                    {isUploadingCover ? t('editor.uploading') : t('editor.uploadCover')}
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept={IMAGE_ACCEPT}
                    className="editor-file-input"
                    data-testid="input-upload-cover"
                    onChange={handleCoverFileChange}
                  />
                </div>
                <p className="editor-field-hint">{t('editor.uploadHint')}</p>
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
                <div className="editor-content-label-row">
                  <label className="form-label" htmlFor="post-content">
                    {t('editor.content')}
                  </label>
                  <button
                    type="button"
                    className="btn btn-secondary editor-upload-btn editor-upload-btn--inline"
                    onClick={() => contentImageInputRef.current?.click()}
                    disabled={isUploadingContent}
                    data-testid="btn-upload-content-image"
                  >
                    <ImagePlus size={16} aria-hidden="true" />
                    {isUploadingContent ? t('editor.uploading') : t('editor.uploadContentImage')}
                  </button>
                  <input
                    ref={contentImageInputRef}
                    type="file"
                    accept={IMAGE_ACCEPT}
                    multiple
                    className="editor-file-input"
                    data-testid="input-upload-content-image"
                    onChange={handleContentFileChange}
                  />
                </div>
                <p className="editor-field-hint editor-field-hint--content">{t('editor.uploadContentHint')}</p>
                <textarea
                  ref={contentTextareaRef}
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

              {uploadError && (
                <p className="editor-upload-error" role="alert">
                  {uploadError}
                </p>
              )}
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
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>
              </div>
            </article>
          )}
        </aside>
      </div>
    </div>
  );
};
