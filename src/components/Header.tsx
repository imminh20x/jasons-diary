import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Feather, ShieldAlert, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdminAuthenticated, setLocalMockAuthenticated } from '../utils/adminAuth';
import './Header.css';

type AppLanguage = 'en' | 'vi';

const LangSwitch: React.FC<{ className?: string; showLabel?: boolean }> = ({
  className = '',
  showLabel = false,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('vi') ? 'vi' : 'en';

  const setLanguage = (lang: AppLanguage) => {
    void i18n.changeLanguage(lang);
  };

  return (
    <div className={className} role="group" aria-label={t('header.language')}>
      {showLabel && <span className="sidebar-lang-label">{t('header.language')}</span>}
      <div className="lang-switch">
        <button
          type="button"
          className={`lang-switch-btn ${currentLang === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
          data-testid="btn-lang-en"
        >
          EN
        </button>
        <button
          type="button"
          className={`lang-switch-btn ${currentLang === 'vi' ? 'active' : ''}`}
          onClick={() => setLanguage('vi')}
          data-testid="btn-lang-vi"
        >
          VI
        </button>
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app_theme');
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
    return 'light';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => isAdminAuthenticated(user));

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAdminAuthenticated(user));
    };

    window.addEventListener('storage', checkAuth);
    checkAuth();

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [user]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('app_theme', next);
      return next;
    });
  };

  const handleLogout = async () => {
    setLocalMockAuthenticated(false);
    await logout();
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsSidebarOpen(false);
    }, 0);
  }, [location.pathname]);

  return (
    <header className={`header ${isVisible ? '' : 'header--hidden'}`}>
      <div className="container header-nav">
        <Link to="/" className="header-logo" data-testid="nav-link-home">
          <Feather size={20} />
          <span>{t('header.logo')}</span>
        </Link>

        <div className="header-links desktop-only">
          <Link
            to="/"
            className={`header-link ${location.pathname === '/' ? 'active' : ''}`}
            data-testid="nav-link-home"
          >
            {t('header.home')}
          </Link>

          <Link
            to="/about"
            className={`header-link ${location.pathname === '/about' ? 'active' : ''}`}
            data-testid="nav-link-about"
          >
            {t('header.about')}
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/admin"
                className={`header-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                data-testid="nav-link-admin"
              >
                {t('header.dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                title={t('header.logout')}
              >
                <LogOut size={14} />
                {t('header.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/admin"
              className={`header-link ${location.pathname === '/admin' ? 'active' : ''}`}
              data-testid="nav-link-admin"
            >
              <ShieldAlert size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
              {t('header.admin')}
            </Link>
          )}

          <LangSwitch />

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            data-testid="btn-theme-toggle"
            aria-label={t('header.toggleTheme')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="header-mobile-actions mobile-only">
          <LangSwitch />

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={t('header.toggleTheme')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mobile-menu-btn"
            aria-label={t('header.openMenu')}
            data-testid="btn-mobile-menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`sidebar-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="header-logo" onClick={() => setIsSidebarOpen(false)}>
            <Feather size={20} />
            <span>{t('header.logo')}</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="sidebar-close-btn"
            aria-label={t('header.closeMenu')}
            data-testid="btn-sidebar-close"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-links">
          <Link
            to="/"
            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
            data-testid="sidebar-link-home"
          >
            {t('header.home')}
          </Link>

          <Link
            to="/about"
            className={`sidebar-link ${location.pathname === '/about' ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
            data-testid="sidebar-link-about"
          >
            {t('header.about')}
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/admin"
                className={`sidebar-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
                data-testid="sidebar-link-admin"
              >
                {t('header.dashboard')}
              </Link>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleLogout();
                }}
                className="btn btn-secondary sidebar-logout-btn"
              >
                <LogOut size={16} />
                {t('header.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/admin"
              className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
              data-testid="sidebar-link-admin"
            >
              <ShieldAlert size={16} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
              {t('header.adminLogin')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
