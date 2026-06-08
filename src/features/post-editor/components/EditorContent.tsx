import { useTranslation } from 'react-i18next';
import { ImagePlus, Link } from 'lucide-react';

interface EditorContentProps {
  summary: string;
  setSummary: (summary: string) => void;
  content: string;
  setContent: (content: string) => void;
  contentTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleContentScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  isUploadingImage: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contentImageInputRef: React.RefObject<HTMLInputElement | null>;
  IMAGE_ACCEPT: string;
}

export function EditorContent({
  summary,
  setSummary,
  content,
  setContent,
  contentTextareaRef,
  handleContentScroll,
  isUploadingImage,
  handleImageUpload,
  contentImageInputRef,
  IMAGE_ACCEPT,
}: EditorContentProps) {
  const { t } = useTranslation();

  return (
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
          className="form-input"
        />
        <p className="editor-field-hint">{t('editor.summaryHint')}</p>
      </div>

      <div className="form-group">
        <div className="editor-content-label-row">
          <label className="form-label" htmlFor="post-content">
            {t('editor.content')}
          </label>
          <div className="editor-toolbar">
            <button
              type="button"
              className="btn btn-secondary editor-upload-btn editor-upload-btn--inline"
              onClick={() => contentImageInputRef.current?.click()}
              disabled={isUploadingImage}
              title={t('editor.insertImage')}
              data-testid="btn-insert-image"
            >
              <ImagePlus size={16} aria-hidden="true" />
              {isUploadingImage ? t('editor.uploading') : ''}
            </button>
            <input
              ref={contentImageInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="editor-file-input"
              data-testid="input-insert-image"
              onChange={handleImageUpload}
            />
          </div>
        </div>
        <p className="editor-field-hint editor-field-hint--content">
          {t('editor.markdownHint')}
          <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer">
            Markdown Guide <Link size={12} style={{ display: 'inline', marginLeft: 4 }} aria-hidden="true" />
          </a>
        </p>
        <textarea
          id="post-content"
          ref={contentTextareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onScroll={handleContentScroll}
          placeholder={t('editor.contentPlaceholder')}
          className="form-input editor-content-textarea"
          data-testid="textarea-post-content"
          required
        />
      </div>
    </section>
  );
}
