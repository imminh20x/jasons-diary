import { useTranslation } from 'react-i18next';
import { ImagePlus } from 'lucide-react';
import { PostTagsInput } from '../../../components/PostTagsInput';

interface EditorMediaProps {
  coverImage: string;
  setCoverImage: (url: string) => void;
  isUploadingCover: boolean;
  handleCoverFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  uploadError: string | null;
  IMAGE_ACCEPT: string;
}

export function EditorMedia({
  coverImage,
  setCoverImage,
  isUploadingCover,
  handleCoverFileChange,
  coverInputRef,
  selectedTags,
  setSelectedTags,
  uploadError,
  IMAGE_ACCEPT,
}: EditorMediaProps) {
  const { t } = useTranslation();

  return (
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
        {uploadError && (
          <p className="editor-upload-error" role="alert">
            {uploadError}
          </p>
        )}
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
  );
}
