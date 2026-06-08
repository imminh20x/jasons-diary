import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Edit, Eye } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getPostById, savePost } from '../../services/postService';
import { uploadImage } from '../../services/db';
import { compressImage } from '../../utils/imageUrl';
import { isAdminAuthenticated } from '../../utils/adminAuth';
import { SITE_AUTHOR } from '../../constants/siteAuthor';
import type { BlogPost } from '../../types/post';

const imageAltFromFile = (fileName: string): string => {
  const baseName = fileName.replace(/\.[^.]+$/, '').trim();
  return baseName.replace(/[-_]+/g, ' ').trim();
};

import { useEditorScrollSync } from './hooks/useEditorScrollSync';
import { EditorBasics } from './components/EditorBasics';
import { EditorMedia } from './components/EditorMedia';
import { EditorContent } from './components/EditorContent';
import { EditorPreview } from './components/EditorPreview';

import './PostEditorForm.css';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

interface PostEditorFormProps {
  id?: string;
}

export function PostEditorForm({ id }: PostEditorFormProps) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
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

  const { contentTextareaRef, previewPaneRef, handleContentScroll, handlePreviewScroll } = useEditorScrollSync();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    void getPostById(id).then((result) => {
      if (cancelled) return;

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
    if (loading) return;

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

  const handleImageUpload = async (file: File, target: 'cover' | 'content') => {
    setUploadError('');
    if (target === 'cover') setIsUploadingCover(true);
    else setIsUploadingContent(true);

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
      
      const textarea = contentTextareaRef.current;
      const insertAt = textarea?.selectionStart ?? content.length;
      const insertEnd = textarea?.selectionEnd ?? content.length;
      const snippet = `\n![${alt}](${data.url})\n`;

      setContent((prev) => `${prev.slice(0, insertAt)}${snippet}${prev.slice(insertEnd)}`);

      const cursor = insertAt + snippet.length;
      requestAnimationFrame(() => {
        textarea?.focus();
        textarea?.setSelectionRange(cursor, cursor);
      });
    } catch {
      setUploadError(t('editor.uploadFailed'));
    } finally {
      if (target === 'cover') setIsUploadingCover(false);
      else setIsUploadingContent(false);
    }
  };

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    void handleImageUpload(file, 'cover');
  };

  const handleContentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    void handleImageUpload(file, 'content');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !slug.trim()) {
      alert(t('editor.requiredAlert'));
      return;
    }

    try {
      if (isEditing && id) {
        await savePost({
          id,
          title,
          slug,
          summary,
          content,
          tags: selectedTags,
          status,
          coverImage,
          author: SITE_AUTHOR.name,
        });
      } else {
        await savePost({
          title,
          slug,
          summary,
          content,
          tags: selectedTags,
          status,
          coverImage,
          author: SITE_AUTHOR.name,
        });
      }
      navigate('/admin');
    } catch (error) {
      console.error('Error saving post:', error);
      alert(t('editor.saveError'));
    }
  };

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

      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="editor-top-sections">
          <EditorBasics
            title={title}
            handleTitleChange={handleTitleChange}
            slug={slug}
            handleSlugChange={handleSlugChange}
            status={status}
            setStatus={setStatus}
          />
          <EditorMedia
            coverImage={coverImage}
            setCoverImage={setCoverImage}
            isUploadingCover={isUploadingCover}
            handleCoverFileChange={handleCoverFileChange}
            coverInputRef={coverInputRef}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            uploadError={uploadError}
            IMAGE_ACCEPT={IMAGE_ACCEPT}
          />
        </div>

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

        <div className="editor-split-container">
          <div className={`editor-pane ${mobileTab !== 'edit' ? 'pane-hidden-mobile' : ''}`}>
            <EditorContent
              summary={summary}
              setSummary={setSummary}
              content={content}
              setContent={setContent}
              contentTextareaRef={contentTextareaRef}
              handleContentScroll={handleContentScroll}
              isUploadingImage={isUploadingContent}
              handleImageUpload={handleContentFileChange}
              contentImageInputRef={contentImageInputRef}
              IMAGE_ACCEPT={IMAGE_ACCEPT}
            />
          </div>

          <EditorPreview
            title={title}
            summary={summary}
            content={content}
            coverImage={coverImage}
            selectedTags={selectedTags}
            previewPaneRef={previewPaneRef}
            handlePreviewScroll={handlePreviewScroll}
            mobileTab={mobileTab}
          />
        </div>
      </form>
    </div>
  );
}
