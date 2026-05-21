import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Briefcase, Award, GraduationCap, ArrowUpRight } from 'lucide-react';
import { SITE_AUTHOR } from '../constants/siteAuthor';
import { SITE_CONTACT, contactEmailHref, hasContactEmail } from '../constants/siteContact';
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

export const About: React.FC = () => {
  const { t } = useTranslation();
  const tripotaBullets = t('about.jobs.tripota.bullets', { returnObjects: true }) as string[];
  const nfqBullets = t('about.jobs.nfq.bullets', { returnObjects: true }) as string[];

  return (
    <div className="about-page fade-in">
      <div className="ambient-glow" />

      <section className="about-hero-section">
        <div className="container about-hero-container">
          <div className="about-profile-wrapper">
            <img
              src={SITE_AUTHOR.avatar}
              alt={t('about.avatarAlt')}
              className="about-avatar-img"
            />
          </div>
          <div className="about-hero-text">
            <span className="about-eyebrow">{t('about.eyebrow')}</span>
            <h1 className="about-name" data-testid="about-name">{t('about.name')}</h1>
            <p className="about-title">{t('about.title')}</p>
            <p className="about-bio">{t('about.bio')}</p>

            <div className="about-actions-row">
              {hasContactEmail() && (
              <a href={contactEmailHref()} className="btn btn-primary" data-testid="btn-contact-email">
                <Mail size={16} /> {t('about.contactMe')}
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
              <h3 className="skills-category-title">{t('about.skills.ai.title')}</h3>
              <p className="skills-category-desc">{t('about.skills.ai.desc')}</p>
              <div className="skills-tags">
                <span>Gen AI</span>
                <span>AI rules and skills</span>
                <span>AI tools</span>
                <span>AI workflows</span>
                <span>MCP</span>
              </div>
            </div>

            <div className="skills-card">
              <h3 className="skills-category-title">{t('about.skills.qa.title')}</h3>
              <p className="skills-category-desc">{t('about.skills.qa.desc')}</p>
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
              <h3 className="skills-category-title">{t('about.skills.sql.title')}</h3>
              <p className="skills-category-desc">{t('about.skills.sql.desc')}</p>
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
              <div className="timeline-item">
                <div className="timeline-badge">
                  <Briefcase size={16} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-date">{t('about.jobs.tripota.date')}</span>
                  <h4 className="timeline-role">{t('about.jobs.tripota.role')}</h4>
                  <h5 className="timeline-company">{t('about.jobs.tripota.company')}</h5>
                  <ul className="timeline-desc-list">
                    {tripotaBullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-badge">
                  <Briefcase size={16} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-date">{t('about.jobs.nfq.date')}</span>
                  <h4 className="timeline-role">{t('about.jobs.nfq.role')}</h4>
                  <h5 className="timeline-company">{t('about.jobs.nfq.company')}</h5>
                  <ul className="timeline-desc-list">
                    {nfqBullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
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
                  <span className="timeline-date">{t('about.certs.education.date')}</span>
                  <h4 className="timeline-role">{t('about.certs.education.role')}</h4>
                  <h5 className="timeline-company">{t('about.certs.education.company')}</h5>
                  <p className="timeline-desc">{t('about.certs.education.desc')}</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-badge">
                  <Award size={16} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-date">2024</span>
                  <h4 className="timeline-role">{t('about.certs.toeic.role')}</h4>
                  <h5 className="timeline-company">{t('about.certs.toeic.company')}</h5>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-badge">
                  <Award size={16} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-date">2024</span>
                  <h4 className="timeline-role">{t('about.certs.efset.role')}</h4>
                  <h5 className="timeline-company">{t('about.certs.efset.company')}</h5>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-badge">
                  <Award size={16} />
                </div>
                <div className="timeline-content">
                  <span className="timeline-date">2021</span>
                  <h4 className="timeline-role">{t('about.certs.aws.role')}</h4>
                  <h5 className="timeline-company">{t('about.certs.aws.company')}</h5>
                  <p className="timeline-desc">{t('about.certs.aws.desc')}</p>
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
    </div>
  );
};
