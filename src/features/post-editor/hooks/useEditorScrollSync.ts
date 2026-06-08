import { useRef } from 'react';

export function useEditorScrollSync() {
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const previewPaneRef = useRef<HTMLElement>(null);
  const scrollSource = useRef<'left' | 'right' | null>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleContentScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (scrollSource.current === 'right') return;
    scrollSource.current = 'left';

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      scrollSource.current = null;
    }, 50);

    const textarea = e.currentTarget;
    const previewPane = previewPaneRef.current;
    if (!previewPane) return;

    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    if (!isNaN(scrollPercentage) && textarea.scrollHeight > textarea.clientHeight) {
      previewPane.scrollTop = scrollPercentage * (previewPane.scrollHeight - previewPane.clientHeight);
    }
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLElement>) => {
    if (scrollSource.current === 'left') return;
    scrollSource.current = 'right';

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      scrollSource.current = null;
    }, 50);

    const previewPane = e.currentTarget;
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const scrollPercentage = previewPane.scrollTop / (previewPane.scrollHeight - previewPane.clientHeight);
    if (!isNaN(scrollPercentage) && previewPane.scrollHeight > previewPane.clientHeight) {
      textarea.scrollTop = scrollPercentage * (textarea.scrollHeight - textarea.clientHeight);
    }
  };

  return {
    contentTextareaRef,
    previewPaneRef,
    handleContentScroll,
    handlePreviewScroll,
  };
}
