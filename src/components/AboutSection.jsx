import { useState } from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { CERTIFICATION, INTERESTS, PROFILE } from '../data/portfolioData';

export default function AboutSection() {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">01 // PROFILE &amp; TRAJECTORY</div>
            <h2 className="section-title">
              ABOUT <span className="section-title-outline">ME</span>
            </h2>
          </div>
          <p className="section-subtitle">
            Combining day-to-day enterprise IT operations with full-stack architecture and
            modern AI Engine automation.
          </p>
        </div>

        <div className="about-grid">
          <article className="surface-card about-story">
            <p className="about-lead">
              I am an <strong>IT Support Professional</strong> transitioning into a{' '}
              <strong>Full-Stack Software Developer</strong>, merging hands-on system
              operations, perimeter defense, and network labs with modern web engineering.
            </p>
            <p className="about-body">
              Currently serving in IT Support &amp; Development at{' '}
              <em>{PROFILE.company}</em>, I build separated React + Node.js platforms,
              PostgreSQL/Supabase backends protected by Row Level Security, and workflow
              automations powered by AI Engine tooling.
            </p>

            <div className="about-meta-grid">
              <div>
                <div className="meta-cell-label">CURRENT ROLE</div>
                <div className="meta-cell-value">{PROFILE.currentRole}</div>
              </div>
              <div>
                <div className="meta-cell-label">BASE LOCATION</div>
                <div className="meta-cell-value">{PROFILE.location}</div>
              </div>
              <div>
                <div className="meta-cell-label">PRIMARY FOCUS</div>
                <div className="meta-cell-value">Full-Stack &amp; AI Engine</div>
              </div>
              <div>
                <div className="meta-cell-label">AVAILABILITY</div>
                <div className="meta-cell-value">Open to Software Dev Roles</div>
              </div>
            </div>

            <div className="interests-wrap">
              <div className="meta-cell-label">FOCUS AREAS &amp; INTERESTS</div>
              <div className="chip-list">
                {INTERESTS.map((item) => (
                  <span key={item} className="mono-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <div className="about-side">
            <aside className="surface-card dossier-card">
              <div className="dossier-top">
                <div className="avatar-frame">
                  {!imgError ? (
                    <img
                      src={PROFILE.avatarUrl}
                      alt={`${PROFILE.firstName} ${PROFILE.lastName}`}
                      className="avatar-img"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.8rem',
                        color: 'var(--crimson)',
                      }}
                    >
                      {PROFILE.monogram}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="dossier-name">
                    Thongek &ldquo;{PROFILE.nickname}&rdquo; Wongpomon
                  </h3>
                  <div className="dossier-handle">@{PROFILE.handle}</div>
                  <div className="dossier-role-line">IT OPS &rarr; SOFTWARE ENGINEER</div>
                </div>
              </div>

              <a
                href={PROFILE.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-link"
              >
                <span>VIEW GITHUB PROFILE</span>
                <ArrowUpRight size={14} />
              </a>
            </aside>

            <aside className="surface-card cert-card">
              <div className="cert-header">
                <span className="cert-badge">VERIFIED CERTIFICATION</span>
                <ShieldCheck size={18} color="var(--crimson)" />
              </div>
              <h3 className="cert-title">{CERTIFICATION.title}</h3>
              <p className="cert-desc">
                Issued by <strong>{CERTIFICATION.issuer}</strong> &mdash;{' '}
                {CERTIFICATION.summary}
              </p>
              <div className="chip-list" style={{ marginBottom: '1rem' }}>
                {CERTIFICATION.tags.map((tag) => (
                  <span key={tag} className="mono-chip">
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={CERTIFICATION.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-link"
              >
                <span>INSPECT CERTIFICATE</span>
                <ArrowUpRight size={14} />
              </a>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
