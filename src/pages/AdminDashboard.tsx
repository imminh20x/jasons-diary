import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Globe, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPosts, deletePost } from '../utils/mockDb';
import type { Post } from '../utils/mockDb';
import { isAdminAuthenticated } from '../utils/adminAuth';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>(() => {
    return isAdminAuthenticated(user) ? getPosts() : [];
  });
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');

  // Authentication check
  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAdminAuthenticated(user)) {
      navigate('/login');
    }
  }, [loading, navigate, user]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === 'published').length;
    const drafts = total - published;
    return { total, published, drafts };
  }, [posts]);

  // Filtered posts based on selected tab
  const filteredPosts = useMemo(() => {
    if (activeTab === 'all') return posts;
    return posts.filter((p) => p.status === activeTab);
  }, [posts, activeTab]);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(t('dashboard.deleteConfirm', { title }))) {
      deletePost(id);
      setPosts(getPosts()); // refresh the state
    }
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  return (
    <div className="container fade-in" style={{ paddingBottom: '5rem' }}>
      <header className="dashboard-header">
        <div>
          <h1 style={{ margin: 0 }}>{t('dashboard.title')}</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Link
          to="/admin/new"
          className="btn btn-primary"
          data-testid="btn-new-post"
        >
          <Plus size={16} /> {t('dashboard.newPost')}
        </Link>
      </header>

      {/* Stats row */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">{t('dashboard.totalArticles')}</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #22c55e' }}>
          <span className="stat-value" style={{ color: '#22c55e' }}>{stats.published}</span>
          <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Globe size={14} /> {t('dashboard.published')}
          </span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid #eab308' }}>
          <span className="stat-value" style={{ color: '#eab308' }}>{stats.drafts}</span>
          <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileText size={14} /> {t('dashboard.drafts')}
          </span>
        </div>
      </section>

      {/* Tabs list */}
      <div className="tab-buttons">
        <button
          onClick={() => setActiveTab('all')}
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
        >
          {t('dashboard.allPosts')} ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
        >
          {t('dashboard.published')} ({stats.published})
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={`tab-btn ${activeTab === 'draft' ? 'active' : ''}`}
        >
          {t('dashboard.drafts')} ({stats.drafts})
        </button>
      </div>

      {/* Table container */}
      <div className="table-container">
        {filteredPosts.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <AlertCircle size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>{t('dashboard.noArticlesTitle')}</h3>
            <p>{t('dashboard.noArticlesDesc')}</p>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>{t('dashboard.tableTitle')}</th>
                <th>{t('dashboard.tableStatus')}</th>
                <th>{t('dashboard.tableTags')}</th>
                <th>{t('dashboard.tableDate')}</th>
                <th>{t('dashboard.tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-highlight)' }}>
                    <Link to={`/post/${post.slug}`}>
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    {post.status === 'published' ? (
                      <span className="badge badge-success">
                        <CheckCircle size={10} style={{ marginRight: '4px' }} />
                        {t('dashboard.statusPublished')}
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <FileText size={10} style={{ marginRight: '4px' }} />
                        {t('dashboard.statusDraft')}
                      </span>
                    )}
                  </td>
                  <td>
                    {post.tags.map((tag) => (
                      <span key={tag} className="dashboard-tag">
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {formatDate(post.publishedAt)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/admin/edit/${post.id}`)}
                        className="btn btn-secondary action-btn"
                        data-testid={`btn-edit-post-${post.id}`}
                        title={t('dashboard.editPost')}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="btn btn-secondary action-btn btn-danger"
                        data-testid={`btn-delete-post-${post.id}`}
                        style={{ color: '#ffffff' }}
                        title={t('dashboard.deletePost')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
