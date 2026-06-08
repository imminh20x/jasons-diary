import { useTranslation } from 'react-i18next';
import { Eye, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { SITE_AUTHOR } from '../../../constants/siteAuthor';
import { getOptimizedCoverImage } from '../../../utils/imageUrl';
import { resolvePostCoverImage } from '../../../utils/generateCoverImage';

interface EditorPreviewProps {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  selectedTags: string[];
  previewPaneRef: React.RefObject<HTMLElement | null>;
  handlePreviewScroll: (e: React.UIEvent<HTMLElement>) => void;
  mobileTab: 'edit' | 'preview';
}

export function EditorPreview({
  title,
  summary,
  content,
  coverImage,
  selectedTags,
  previewPaneRef,
  handlePreviewScroll,
  mobileTab,
}: EditorPreviewProps) {
  const { t } = useTranslation();

  const hasPreviewContent = Boolean(title || content || summary);
  const previewCoverImage = getOptimizedCoverImage(resolvePostCoverImage(coverImage, title), 1200);

  return (
    <div className={`preview-pane-wrapper ${mobileTab !== 'preview' ? 'pane-hidden-mobile' : ''}`}>
      <aside ref={previewPaneRef} className="preview-pane" onScroll={handlePreviewScroll}>
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

            {selectedTags.length > 0 && (
              <div className="preview-tags">
                {selectedTags.map((tag) => (
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
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {content}
              </ReactMarkdown>
            </div>
          </article>
        )}
      </aside>
    </div>
  );
}
