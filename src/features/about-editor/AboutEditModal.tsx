import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { uploadImage } from '../../services/db';
import './AboutEditModal.css';

interface AboutEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  initialData: any;
  onSave: (updatedData: any, syncLang: boolean) => Promise<void>;
}

export const AboutEditModal: React.FC<AboutEditModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  initialData,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'skills' | 'jobs' | 'certs'>('basics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncLang, setSyncLang] = useState(false);

  // Form states
  const [eyebrow, setEyebrow] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Skills state
  const [skills, setSkills] = useState({
    ai: { title: '', desc: '' },
    qa: { title: '', desc: '' },
    sql: { title: '', desc: '' },
  });

  // Jobs/Timeline groups
  const [jobs, setJobs] = useState<any[]>([]);

  // Credentials state
  const [certs, setCerts] = useState({
    education: { date: '', role: '', company: '', desc: '' },
    toeic: { role: '', company: '' },
    efset: { role: '', company: '' },
    aws: { role: '', company: '', desc: '' },
  });

  // Populate form with initial data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setEyebrow(initialData.eyebrow || '');
      setName(initialData.name || '');
      setTitle(initialData.title || '');
      setBio(initialData.bio || '');
      const isRemoteUrl =
        initialData.avatar_url &&
        typeof initialData.avatar_url === 'string' &&
        (initialData.avatar_url.startsWith('http://') || initialData.avatar_url.startsWith('https://'));
      setAvatarUrl(isRemoteUrl ? initialData.avatar_url : '');

      setSkills({
        ai: {
          title: initialData.skills?.ai?.title || '',
          desc: initialData.skills?.ai?.desc || '',
        },
        qa: {
          title: initialData.skills?.qa?.title || '',
          desc: initialData.skills?.qa?.desc || '',
        },
        sql: {
          title: initialData.skills?.sql?.title || '',
          desc: initialData.skills?.sql?.desc || '',
        },
      });

      // Deep copy jobs array to avoid mutating state directly
      if (initialData.jobs?.groups) {
        setJobs(JSON.parse(JSON.stringify(initialData.jobs.groups)));
      } else {
        setJobs([]);
      }

      setCerts({
        education: {
          date: initialData.certs?.education?.date || '',
          role: initialData.certs?.education?.role || '',
          company: initialData.certs?.education?.company || '',
          desc: initialData.certs?.education?.desc || '',
        },
        toeic: {
          role: initialData.certs?.toeic?.role || '',
          company: initialData.certs?.toeic?.company || '',
        },
        efset: {
          role: initialData.certs?.efset?.role || '',
          company: initialData.certs?.efset?.company || '',
        },
        aws: {
          role: initialData.certs?.aws?.role || '',
          company: initialData.certs?.aws?.company || '',
          desc: initialData.certs?.aws?.desc || '',
        },
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: uploadErr } = await uploadImage(file);
      if (uploadErr) {
        setError(uploadErr.message || 'Failed to upload avatar image.');
      } else if (data?.url) {
        setAvatarUrl(data.url);
      }
    } catch (err: any) {
      setError(err.message || 'Avatar upload encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      lang: currentLang,
      avatar_url: avatarUrl,
      eyebrow,
      name,
      title,
      bio,
      skills,
      jobs: { groups: jobs },
      certs,
    };

    try {
      await onSave(payload, syncLang);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes. Please check permissions and database status.');
    } finally {
      setLoading(false);
    }
  };

  // Jobs list functions
  const addJobGroup = () => {
    setJobs([
      ...jobs,
      {
        company: 'New Company',
        positions: [{ date: '2026', role: 'Role', teamSize: 'Team size: 1', bullets: ['New accomplishment'] }],
      },
    ]);
  };

  const updateJobCompany = (groupIndex: number, companyName: string) => {
    const nextJobs = [...jobs];
    nextJobs[groupIndex].company = companyName;
    setJobs(nextJobs);
  };

  const removeJobGroup = (groupIndex: number) => {
    setJobs(jobs.filter((_, idx) => idx !== groupIndex));
  };

  // Job Positions functions
  const addPosition = (groupIndex: number) => {
    const nextJobs = [...jobs];
    nextJobs[groupIndex].positions.push({
      date: '2026',
      role: 'New Role',
      bullets: ['New accomplishment'],
    });
    setJobs(nextJobs);
  };

  const updatePosition = (groupIndex: number, posIndex: number, field: string, value: string) => {
    const nextJobs = [...jobs];
    nextJobs[groupIndex].positions[posIndex] = {
      ...nextJobs[groupIndex].positions[posIndex],
      [field]: value,
    };
    setJobs(nextJobs);
  };

  const removePosition = (groupIndex: number, posIndex: number) => {
    const nextJobs = [...jobs];
    nextJobs[groupIndex].positions = nextJobs[groupIndex].positions.filter(
      (_: any, idx: number) => idx !== posIndex
    );
    setJobs(nextJobs);
  };

  // Job Position Bullets functions
  const addBullet = (groupIndex: number, posIndex: number) => {
    const nextJobs = [...jobs];
    nextJobs[groupIndex].positions[posIndex].bullets.push('New accomplishment');
    setJobs(nextJobs);
  };

  const updateBullet = (groupIndex: number, posIndex: number, bulletIndex: number, value: string) => {
    const nextJobs = [...jobs];
    nextJobs[groupIndex].positions[posIndex].bullets[bulletIndex] = value;
    setJobs(nextJobs);
  };

  const removeBullet = (groupIndex: number, posIndex: number, bulletIndex: number) => {
    const nextJobs = [...jobs];
    nextJobs[groupIndex].positions[posIndex].bullets = nextJobs[groupIndex].positions[posIndex].bullets.filter(
      (_: string, idx: number) => idx !== bulletIndex
    );
    setJobs(nextJobs);
  };

  return (
    <div className="about-edit-backdrop" onClick={onClose}>
      <div className="about-edit-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="about-edit-header">
          <h2 className="about-edit-title">
            {currentLang === 'vi' ? 'Chỉnh sửa trang Giới thiệu' : 'Edit About Page'}
          </h2>
          <button onClick={onClose} className="about-edit-close" data-testid="btn-close-edit-about">
            <X size={20} />
          </button>
        </div>

        {/* Tabs navigation */}
        <div className="about-edit-tabs">
          <button
            onClick={() => setActiveTab('basics')}
            className={`about-edit-tab-btn ${activeTab === 'basics' ? 'active' : ''}`}
            data-testid="btn-tab-basics"
          >
            {currentLang === 'vi' ? 'Thông tin cơ bản' : 'Basics'}
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`about-edit-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            data-testid="btn-tab-skills"
          >
            {currentLang === 'vi' ? 'Kỹ năng chuyên môn' : 'Expertise & Skills'}
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`about-edit-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            data-testid="btn-tab-jobs"
          >
            {currentLang === 'vi' ? 'Kinh nghiệm làm việc' : 'Work Experience'}
          </button>
          <button
            onClick={() => setActiveTab('certs')}
            className={`about-edit-tab-btn ${activeTab === 'certs' ? 'active' : ''}`}
            data-testid="btn-tab-certs"
          >
            {currentLang === 'vi' ? 'Học vấn & Chứng chỉ' : 'Education & Credentials'}
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="about-edit-content">
          {error && (
            <div className="about-edit-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: BASICS */}
          {activeTab === 'basics' && (
            <div className="about-editor-section">
              <h3 className="about-editor-section-title">
                {currentLang === 'vi' ? 'Thông tin chung' : 'General Info'}
              </h3>

              <div className="about-edit-avatar-upload">
                <img
                  src={avatarUrl || initialData?.avatar_url}
                  alt="Avatar Preview"
                  className="about-edit-avatar-preview"
                />
                <div className="about-edit-avatar-actions">
                  <span className="form-label" style={{ marginBottom: 0 }}>
                    {currentLang === 'vi' ? 'Ảnh đại diện' : 'Profile Picture'}
                  </span>
                  <label className="btn btn-secondary about-edit-file-btn">
                    <Upload size={14} style={{ marginRight: '6px' }} />
                    {currentLang === 'vi' ? 'Tải ảnh lên' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste image URL"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '0.25rem', padding: '0.5rem 0.75rem' }}
                    data-testid="input-avatar-url"
                  />
                </div>
              </div>

              <div className="about-grid-2">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    {currentLang === 'vi' ? 'Họ và tên' : 'Name'}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    data-testid="input-about-name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    {currentLang === 'vi' ? 'Chức danh công việc' : 'Professional Title'}
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input"
                    data-testid="input-about-title"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="eyebrow" className="form-label">
                  {currentLang === 'vi' ? 'Trạng thái cơ hội' : 'Availability Eyebrow'}
                </label>
                <input
                  id="eyebrow"
                  type="text"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                  className="form-input"
                  data-testid="input-about-eyebrow"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  {currentLang === 'vi' ? 'Tiểu sử / Giới thiệu ngắn' : 'Biography / Short Bio'}
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '120px' }}
                  data-testid="textarea-about-bio"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === 'skills' && (
            <div className="about-editor-section">
              <h3 className="about-editor-section-title">
                {currentLang === 'vi' ? 'Kỹ năng & Chuyên môn' : 'Expertise & Cards'}
              </h3>

              {/* AI Skill */}
              <div className="about-edit-list-item">
                <div className="about-edit-list-item-header">
                  <span className="about-edit-list-item-title">AI Card</span>
                </div>
                <div className="form-group">
                  <label className="form-label">{currentLang === 'vi' ? 'Tiêu đề' : 'Title'}</label>
                  <input
                    type="text"
                    value={skills.ai.title}
                    onChange={(e) =>
                      setSkills({
                        ...skills,
                        ai: { ...skills.ai, title: e.target.value },
                      })
                    }
                    className="form-input"
                    data-testid="input-skill-ai-title"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{currentLang === 'vi' ? 'Mô tả ngắn' : 'Description'}</label>
                  <textarea
                    value={skills.ai.desc}
                    onChange={(e) =>
                      setSkills({
                        ...skills,
                        ai: { ...skills.ai, desc: e.target.value },
                      })
                    }
                    className="form-textarea"
                    style={{ minHeight: '80px' }}
                    data-testid="textarea-skill-ai-desc"
                  />
                </div>
              </div>

              {/* QA Skill */}
              <div className="about-edit-list-item">
                <div className="about-edit-list-item-header">
                  <span className="about-edit-list-item-title">QA & QC Card</span>
                </div>
                <div className="form-group">
                  <label className="form-label">{currentLang === 'vi' ? 'Tiêu đề' : 'Title'}</label>
                  <input
                    type="text"
                    value={skills.qa.title}
                    onChange={(e) =>
                      setSkills({
                        ...skills,
                        qa: { ...skills.qa, title: e.target.value },
                      })
                    }
                    className="form-input"
                    data-testid="input-skill-qa-title"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{currentLang === 'vi' ? 'Mô tả ngắn' : 'Description'}</label>
                  <textarea
                    value={skills.qa.desc}
                    onChange={(e) =>
                      setSkills({
                        ...skills,
                        qa: { ...skills.qa, desc: e.target.value },
                      })
                    }
                    className="form-textarea"
                    style={{ minHeight: '80px' }}
                    data-testid="textarea-skill-qa-desc"
                  />
                </div>
              </div>

              {/* SQL Skill */}
              <div className="about-edit-list-item">
                <div className="about-edit-list-item-header">
                  <span className="about-edit-list-item-title">SQL Card</span>
                </div>
                <div className="form-group">
                  <label className="form-label">{currentLang === 'vi' ? 'Tiêu đề' : 'Title'}</label>
                  <input
                    type="text"
                    value={skills.sql.title}
                    onChange={(e) =>
                      setSkills({
                        ...skills,
                        sql: { ...skills.sql, title: e.target.value },
                      })
                    }
                    className="form-input"
                    data-testid="input-skill-sql-title"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{currentLang === 'vi' ? 'Mô tả ngắn' : 'Description'}</label>
                  <textarea
                    value={skills.sql.desc}
                    onChange={(e) =>
                      setSkills({
                        ...skills,
                        sql: { ...skills.sql, desc: e.target.value },
                      })
                    }
                    className="form-textarea"
                    style={{ minHeight: '80px' }}
                    data-testid="textarea-skill-sql-desc"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORK EXPERIENCE */}
          {activeTab === 'jobs' && (
            <div className="about-editor-section">
              <h3 className="about-editor-section-title">
                {currentLang === 'vi' ? 'Kinh nghiệm nghề nghiệp' : 'Work Timeline'}
              </h3>

              {jobs.map((group, groupIdx) => (
                <div key={groupIdx} className="about-edit-list-item">
                  <div className="about-edit-list-item-header">
                    <span className="about-edit-list-item-title">
                      {currentLang === 'vi' ? `Công ty #${groupIdx + 1}` : `Company #${groupIdx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeJobGroup(groupIdx)}
                      className="about-edit-btn-danger-text"
                      data-testid={`btn-delete-job-group-${groupIdx}`}
                    >
                      <Trash2 size={12} style={{ marginRight: '4px' }} />
                      {currentLang === 'vi' ? 'Xóa công ty' : 'Delete Company'}
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{currentLang === 'vi' ? 'Tên Công ty' : 'Company Name'}</label>
                    <input
                      type="text"
                      value={group.company}
                      onChange={(e) => updateJobCompany(groupIdx, e.target.value)}
                      className="form-input"
                      data-testid={`input-job-company-${groupIdx}`}
                    />
                  </div>

                  {/* Positions under this company */}
                  <div style={{ marginLeft: '1rem', borderLeft: '2px solid var(--color-border)', paddingLeft: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-highlight)', margin: '1rem 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {currentLang === 'vi' ? 'Vị trí công tác' : 'Positions'}
                    </h4>

                    {group.positions.map((pos: any, posIdx: number) => (
                      <div key={posIdx} style={{ marginBottom: '1.5rem', position: 'relative', borderBottom: '1px dashed var(--color-border)', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => removePosition(groupIdx, posIdx)}
                            className="about-edit-btn-danger-text"
                            style={{ padding: '0.1rem 0.4rem' }}
                            data-testid={`btn-delete-position-${groupIdx}-${posIdx}`}
                          >
                            {currentLang === 'vi' ? 'Xóa vị trí' : 'Delete Position'}
                          </button>
                        </div>

                        <div className="about-grid-2">
                          <div className="form-group">
                            <label className="form-label">{currentLang === 'vi' ? 'Thời gian' : 'Date range'}</label>
                            <input
                              type="text"
                              value={pos.date}
                              onChange={(e) => updatePosition(groupIdx, posIdx, 'date', e.target.value)}
                              className="form-input"
                              placeholder="e.g. May 2024 - Present"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">{currentLang === 'vi' ? 'Vai trò / Chức danh' : 'Role title'}</label>
                            <input
                              type="text"
                              value={pos.role}
                              onChange={(e) => updatePosition(groupIdx, posIdx, 'role', e.target.value)}
                              className="form-input"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">{currentLang === 'vi' ? 'Quy mô đội ngũ' : 'Team size'}</label>
                          <input
                            type="text"
                            value={pos.teamSize || ''}
                            onChange={(e) => updatePosition(groupIdx, posIdx, 'teamSize', e.target.value)}
                            className="form-input"
                            placeholder="e.g. Team size: 8"
                          />
                        </div>

                        {/* Bullets lists */}
                        <div className="about-edit-bullets-editor">
                          <label className="form-label">{currentLang === 'vi' ? 'Mô tả công việc & Thành tựu' : 'Job Duties & Bullets'}</label>
                          {pos.bullets.map((bullet: string, bulletIdx: number) => (
                            <div key={bulletIdx} className="about-edit-bullet-row">
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => updateBullet(groupIdx, posIdx, bulletIdx, e.target.value)}
                                className="form-input"
                                style={{ padding: '0.5rem 0.75rem' }}
                              />
                              <button
                                type="button"
                                onClick={() => removeBullet(groupIdx, posIdx, bulletIdx)}
                                className="about-edit-close"
                                style={{ padding: '0.4rem' }}
                              >
                                <Trash2 size={12} style={{ color: '#ef4444' }} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addBullet(groupIdx, posIdx)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', marginTop: '0.4rem' }}
                          >
                            <Plus size={10} style={{ marginRight: '4px' }} />
                            {currentLang === 'vi' ? 'Thêm dòng' : 'Add Bullet'}
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addPosition(groupIdx)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: '100%', marginTop: '0.5rem' }}
                    >
                      <Plus size={12} style={{ marginRight: '4px' }} />
                      {currentLang === 'vi' ? 'Thêm vị trí mới' : 'Add Position'}
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addJobGroup} className="about-edit-add-btn" data-testid="btn-add-job-group">
                <Plus size={16} />
                {currentLang === 'vi' ? 'Thêm Công ty / Tập đoàn' : 'Add Company / Experience'}
              </button>
            </div>
          )}

          {/* TAB 4: EDUCATION & CREDENTIALS */}
          {activeTab === 'certs' && (
            <div className="about-editor-section">
              <h3 className="about-editor-section-title">
                {currentLang === 'vi' ? 'Học vấn & Chứng nhận chuyên môn' : 'Credentials & Education'}
              </h3>

              {/* Education section */}
              <div className="about-edit-list-item">
                <div className="about-edit-list-item-header">
                  <span className="about-edit-list-item-title">{currentLang === 'vi' ? 'Học vấn / Đại học' : 'Education / University'}</span>
                </div>
                <div className="about-grid-2">
                  <div className="form-group">
                    <label className="form-label">{currentLang === 'vi' ? 'Thời gian' : 'Date range'}</label>
                    <input
                      type="text"
                      value={certs.education.date}
                      onChange={(e) =>
                        setCerts({
                          ...certs,
                          education: { ...certs.education, date: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{currentLang === 'vi' ? 'Chuyên ngành' : 'Major/Role'}</label>
                    <input
                      type="text"
                      value={certs.education.role}
                      onChange={(e) =>
                        setCerts({
                          ...certs,
                          education: { ...certs.education, role: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{currentLang === 'vi' ? 'Trường đào tạo' : 'School/University'}</label>
                  <input
                    type="text"
                    value={certs.education.company}
                    onChange={(e) =>
                      setCerts({
                        ...certs,
                        education: { ...certs.education, company: e.target.value },
                      })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{currentLang === 'vi' ? 'Chi tiết khác (GPA, v.v.)' : 'Description (GPA, etc.)'}</label>
                  <input
                    type="text"
                    value={certs.education.desc}
                    onChange={(e) =>
                      setCerts({
                        ...certs,
                        education: { ...certs.education, desc: e.target.value },
                      })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              {/* TOEIC */}
              <div className="about-edit-list-item">
                <div className="about-edit-list-item-header">
                  <span className="about-edit-list-item-title">TOEIC Certificate</span>
                </div>
                <div className="about-grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{currentLang === 'vi' ? 'Kết quả / Điểm số' : 'Score/Role'}</label>
                    <input
                      type="text"
                      value={certs.toeic.role}
                      onChange={(e) =>
                        setCerts({
                          ...certs,
                          toeic: { ...certs.toeic, role: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{currentLang === 'vi' ? 'Tổ chức cấp' : 'Organization'}</label>
                    <input
                      type="text"
                      value={certs.toeic.company}
                      onChange={(e) =>
                        setCerts({
                          ...certs,
                          toeic: { ...certs.toeic, company: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* EF SET */}
              <div className="about-edit-list-item">
                <div className="about-edit-list-item-header">
                  <span className="about-edit-list-item-title">EF SET Certificate</span>
                </div>
                <div className="about-grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{currentLang === 'vi' ? 'Trình độ đạt được' : 'Level/Role'}</label>
                    <input
                      type="text"
                      value={certs.efset.role}
                      onChange={(e) =>
                        setCerts({
                          ...certs,
                          efset: { ...certs.efset, role: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{currentLang === 'vi' ? 'Đơn vị đánh giá' : 'Organization'}</label>
                    <input
                      type="text"
                      value={certs.efset.company}
                      onChange={(e) =>
                        setCerts({
                          ...certs,
                          efset: { ...certs.efset, company: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* AWS */}
              <div className="about-edit-list-item">
                <div className="about-edit-list-item-header">
                  <span className="about-edit-list-item-title">AWS / Projects Competition</span>
                </div>
                <div className="about-grid-2">
                  <div className="form-group">
                    <label className="form-label">{currentLang === 'vi' ? 'Chứng nhận / Danh hiệu' : 'Award/Role'}</label>
                    <input
                      type="text"
                      value={certs.aws.role}
                      onChange={(e) =>
                        setCerts({
                          ...certs,
                          aws: { ...certs.aws, role: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{currentLang === 'vi' ? 'Đơn vị tổ chức' : 'Organization'}</label>
                    <input
                      type="text"
                      value={certs.aws.company}
                      onChange={(e) =>
                        setCerts({
                          ...certs,
                          aws: { ...certs.aws, company: e.target.value },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{currentLang === 'vi' ? 'Chi tiết giải thưởng/dự án' : 'Details'}</label>
                  <input
                    type="text"
                    value={certs.aws.desc}
                    onChange={(e) =>
                      setCerts({
                        ...certs,
                        aws: { ...certs.aws, desc: e.target.value },
                      })
                    }
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="about-edit-footer" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--type-body-sm)', color: 'var(--color-text)' }}>
            <input
              type="checkbox"
              checked={syncLang}
              onChange={(e) => setSyncLang(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
              data-testid="checkbox-sync-lang"
            />
            {currentLang === 'vi' ? 'Đồng bộ sang bản tiếng Anh (EN)' : 'Sync to Vietnamese (VI) version'}
          </label>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
              data-testid="btn-cancel-edit-about"
            >
              {currentLang === 'vi' ? 'Hủy bỏ' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
              disabled={loading}
              data-testid="btn-save-edit-about"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Save size={14} />
              {loading ? (currentLang === 'vi' ? 'Đang lưu...' : 'Saving...') : (currentLang === 'vi' ? 'Lưu thay đổi' : 'Save Changes')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
