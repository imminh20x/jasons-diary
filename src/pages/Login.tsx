import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdminAuthenticated } from '../utils/adminAuth';
import './Login.css';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdminAuthenticated(user)) {
      navigate('/admin', { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t('login.errors.required'));
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: loginError } = await login(email, password);
      if (loginError) {
        setError(t('login.errors.invalid'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="ambient-glow" style={{ top: '15%', left: '30%', width: '40%' }} />

      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            backgroundColor: 'var(--color-bg-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            padding: '1rem',
            color: 'var(--color-text-highlight)'
          }}>
            <Shield size={32} />
          </div>
        </div>

        <h1 className="login-title">{t('login.title')}</h1>
        <p className="login-subtitle">{t('login.subtitle')}</p>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {t('login.email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              data-testid="input-login-email"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="password">
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              data-testid="input-login-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem' }}
            data-testid="btn-login-submit"
            disabled={isSubmitting}
          >
            {t('login.signIn')}
          </button>
        </form>
      </div>
    </div>
  );
};
