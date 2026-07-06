import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Briefcase, Award, GraduationCap, ArrowUpRight, Edit2 } from 'lucide-react';
import { SITE_AUTHOR } from '../constants/siteAuthor';
import { SITE_CONTACT, contactEmailHref, hasContactEmail } from '../constants/siteContact';
import { fetchAboutProfile, saveAboutProfile } from '../services/aboutService';
import { AboutEditModal } from '../features/about-editor/AboutEditModal';
import { useIsLoggedIn } from '../hooks/useIsLoggedIn';
import './About.css';

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-github"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-linkedin"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-facebook"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

type AboutJobPosition = {
  date: string;
  role: string;
  teamSize?: string;
  bullets: string[];
};

type AboutJobGroup = {
  company: string;
  positions: AboutJobPosition[];
};

export const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('vi') ? 'vi' : 'en';
  const isLoggedIn = useIsLoggedIn();

  const [profile, setProfile] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch the about profile when the language changes
  useEffect(() => {
    let active = true;
    void fetchAboutProfile(currentLang).then((data) => {
      if (active) {
        setProfile(data);
      }
    });
    return () => {
      active = false;
    };
  }, [currentLang]);

  // Compute default values from the translation JSON files
  const defaultProfile = useMemo(() => {
    return {
      eyebrow: t('about.eyebrow'),
      name: t('about.name'),
      title: t('about.title'),
      bio: t('about.bio'),
      avatarAlt: t('about.avatarAlt'),
      avatar_url: SITE_AUTHOR.avatar,
      skills: {
        ai: {
          title: t('about.skills.ai.title'),
          desc: t('about.skills.ai.desc'),
        },
        qa: {
          title: t('about.skills.qa.title'),
          desc: t('about.skills.qa.desc'),
        },
        sql: {
          title: t('about.skills.sql.title'),
          desc: t('about.skills.sql.desc'),
        },
      },
      jobs: {
        groups: t('about.jobs.groups', { returnObjects: true }) as AboutJobGroup[],
      },
      certs: {
        education: {
          date: t('about.certs.education.date'),
          role: t('about.certs.education.role'),
          company: t('about.certs.education.company'),
          desc: t('about.certs.education.desc'),
        },
        toeic: {
          role: t('about.certs.toeic.role'),
          company: t('about.certs.toeic.company'),
        },
        efset: {
          role: t('about.certs.efset.role'),
          company: t('about.certs.efset.company'),
        },
        aws: {
          role: t('about.certs.aws.role'),
          company: t('about.certs.aws.company'),
          desc: t('about.certs.aws.desc'),
        },
      },
    };
  }, [t]);

  // Merge the database profile values (if any) with the default local translations
  const data = useMemo(() => {
    if (!profile) return defaultProfile;
    return {
      eyebrow: profile.eyebrow || defaultProfile.eyebrow,
      name: profile.name || defaultProfile.name,
      title: profile.title || defaultProfile.title,
      bio: profile.bio || defaultProfile.bio,
      avatarAlt: profile.name ? `${profile.name} - Jason` : defaultProfile.avatarAlt,
      avatar_url: profile.avatar_url || defaultProfile.avatar_url,
      skills: {
        ai: {
          title: profile.skills?.ai?.title || defaultProfile.skills.ai.title,
          desc: profile.skills?.ai?.desc || defaultProfile.skills.ai.desc,
        },
        qa: {
          title: profile.skills?.qa?.title || defaultProfile.skills.qa.title,
          desc: profile.skills?.qa?.desc || defaultProfile.skills.qa.desc,
        },
        sql: {
          title: profile.skills?.sql?.title || defaultProfile.skills.sql.title,
          desc: profile.skills?.sql?.desc || defaultProfile.skills.sql.desc,
        },
      },
      jobs: {
        groups: profile.jobs?.groups || defaultProfile.jobs.groups,
      },
      certs: {
        education: {
          date: profile.certs?.education?.date || defaultProfile.certs.education.date,
          role: profile.certs?.education?.role || defaultProfile.certs.education.role,
          company: profile.certs?.education?.company || defaultProfile.certs.education.company,
          desc: profile.certs?.education?.desc || defaultProfile.certs.education.desc,
        },
        toeic: {
          role: profile.certs?.toeic?.role || defaultProfile.certs.toeic.role,
          company: profile.certs?.toeic?.company || defaultProfile.certs.toeic.company,
        },
        efset: {
          role: profile.certs?.efset?.role || defaultProfile.certs.efset.role,
          company: profile.certs?.efset?.company || defaultProfile.certs.efset.company,
        },
        aws: {
          role: profile.certs?.aws?.role || defaultProfile.certs.aws.role,
          company: profile.certs?.aws?.company || defaultProfile.certs.aws.company,
          desc: profile.certs?.aws?.desc || defaultProfile.certs.aws.desc,
        },
      },
    };
  }, [profile, defaultProfile]);

  const handleSave = async (updatedData: any) => {
    const saved = await saveAboutProfile(updatedData);
    if (saved) {
      setProfile(saved);
    }
  };

  return (
    <div className="about-page fade-in">
      <div className="ambient-glow" />

      <section className="about-hero-section">
        <div className="container about-hero-container">
          <div className="about-profile-wrapper">
            <img
              src={data.avatar_url}
              alt={data.avatarAlt}
              className="about-avatar-img"
            />
          </div>
          <div className="about-hero-text">
            <span className="about-eyebrow about-availability-badge">{data.eyebrow}</span>
            <h1 className="about-name" data-testid="about-name">
              {data.name}
              {isLoggedIn && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="about-inline-edit-btn"
                  title={currentLang === 'vi' ? 'Chỉnh sơ thông tin' : 'Edit Information'}
                  data-testid="btn-edit-about-page"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </h1>
            <p className="about-title">{data.title}</p>
            <p className="about-bio">{data.bio}</p>

            <div className="about-actions-row">
              {hasContactEmail() && (
              <a href={contactEmailHref()} className="btn btn-primary" data-testid="btn-contact-email">
                <Mail size={16} /> {t('about.contactMe')}
              </a>
              )}  
              {SITE_CONTACT.linkedin && (
              <a
                href={SITE_CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                data-testid="link-linkedin"
              >
                <LinkedinIcon /> LinkedIn <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
              </a>
              )}
                {SITE_CONTACT.github && (
              <a
                href={SITE_CONTACT.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                data-testid="link-github"
              >
                <GithubIcon /> GitHub <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
              </a>
              )}
                {SITE_CONTACT.facebook && (
              <a
                href={SITE_CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                data-testid="link-facebook"
              >
                <FacebookIcon /> Facebook <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
              </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="about-content-section">
        <div className="container">
          <div className="section-divider">
            <span className="section-eyebrow">{t('about.expertiseSkills')}</span>
            <div className="divider-line" />
          </div>

          <div className="skills-grid">
            <div className="skills-card">
              <h3 className="skills-category-title">{data.skills.ai.title}</h3>
              <p className="skills-category-desc">{data.skills.ai.desc}</p>
              <div className="skills-tags">
                <span>Gen AI</span>
                <span>AI rules and skills</span>
                <span>AI tools</span>
                <span>AI workflows</span>
                <span>MCP</span>
              </div>
            </div>

            <div className="skills-card">
              <h3 className="skills-category-title">{data.skills.qa.title}</h3>
              <p className="skills-category-desc">{data.skills.qa.desc}</p>
              <div className="skills-tags">
                <span>JS/TS</span>
                <span>Playwright E2E</span>
                <span>Page Object Model (POM)</span>
                <span>RESTful APIs</span>
                <span>Manual Testing</span>
                <span>CI/CD Integration</span>
                <span>Chrome DevTools Protocol</span>
              </div>
            </div>

            <div className="skills-card">
              <h3 className="skills-category-title">{data.skills.sql.title}</h3>
              <p className="skills-category-desc">{data.skills.sql.desc}</p>
              <div className="skills-tags">
                <span>PostgreSQL</span>
                <span>DBeaver</span>
                <span>MongoDB</span>
                <span>MongoAtlas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-content-section" style={{ paddingBottom: '4rem' }}>
        <div className="container timeline-container">
          <div className="timeline-column">
            <div className="section-divider">
              <span className="section-eyebrow">{t('about.experience')}</span>
              <div className="divider-line" />
            </div>

            <div className="timeline">
              {data.jobs.groups.map((group: any) => (
                <div key={group.company} className="timeline-item">
                  <div className="timeline-badge">
                    <Briefcase size={16} />
                  </div>
                  <div className="timeline-content">
                    <h3 className="timeline-company">{group.company}</h3>
                    <ul className="timeline-positions">
                      {group.positions.map((position: any) => (
                        <li
                          key={`${position.role}-${position.date}`}
                          className="timeline-position"
                        >
                          <span className="timeline-date">{position.date}</span>
                          <h4 className="timeline-role">
                            {position.role}
                            {position.teamSize ? ` - ${position.teamSize}` : null}
                          </h4>
                          <ul className="timeline-desc-list">
                            {position.bullets.map((item: string) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="timeline-column">
            <div className="section-divider">
              <span className="section-eyebrow">{t('about.educationCredentials')}</span>
              <div className="divider-line" />
            </div>

            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-badge">
                  <GraduationCap size={16} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-date">{data.certs.education.date}</span>
                  <h3 className="timeline-company">{data.certs.education.company}</h3>
                  <h4 className="timeline-role">{data.certs.education.role}</h4>
                  <p className="timeline-desc">{data.certs.education.desc}</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-badge">
                  <Award size={16} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-date">2024</span>
                  <h3 className="timeline-company">{data.certs.toeic.company}</h3>
                  <h4 className="timeline-role">{data.certs.toeic.role}</h4>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-badge">
                  <Award size={16} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-date">2024</span>
                  <h3 className="timeline-company">{data.certs.efset.company}</h3>
                  <h4 className="timeline-role">{data.certs.efset.role}</h4>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-badge">
                  <Award size={16} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-date">2021</span>
                  <h3 className="timeline-company">{data.certs.aws.company}</h3>
                  <h4 className="timeline-role">{data.certs.aws.role}</h4>
                  <p className="timeline-desc">{data.certs.aws.desc}</p>
                  <a
                    href="https://buildonvietnam21.s3.ap-southeast-1.amazonaws.com/BOVN21+Certificates/Timo+Digital+Bank_Technophile_Cao+Minh+Do.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="timeline-link"
                    data-testid="link-aws-certificate"
                  >
                    {t('about.viewCertificate')} <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* About edit modal */}
      <AboutEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentLang={currentLang}
        initialData={data}
        onSave={handleSave}
      />
    </div>
  );
};

