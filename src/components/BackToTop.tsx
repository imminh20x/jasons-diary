import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';
import './BackToTop.css';

const SCROLL_THRESHOLD_PX = 480;

export const BackToTop = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD_PX);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return createPortal(
    <button
      type="button"
      className={`back-to-top-btn${isVisible ? ' back-to-top-btn--visible' : ''}`}
      onClick={scrollToTop}
      aria-label={t('common.backToTop')}
      data-testid="btn-back-to-top"
    >
      <ArrowUp className="back-to-top-btn__icon" size={22} strokeWidth={2.25} aria-hidden="true" />
    </button>,
    document.body,
  );
};
