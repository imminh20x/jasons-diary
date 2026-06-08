import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

interface EditorBasicsProps {
  title: string;
  handleTitleChange: (title: string) => void;
  slug: string;
  handleSlugChange: (slug: string) => void;
  status: 'draft' | 'published';
  setStatus: (status: 'draft' | 'published') => void;
}

export function EditorBasics({
  title,
  handleTitleChange,
  slug,
  handleSlugChange,
  status,
  setStatus,
}: EditorBasicsProps) {
  const { t } = useTranslation();

  return (
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
  );
}
