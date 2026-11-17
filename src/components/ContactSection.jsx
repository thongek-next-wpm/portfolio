import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Mail, Send } from 'lucide-react';
import { PROFILE, SOCIAL_LINKS } from '../data/portfolioData';

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  const handleComposeMail = (e) => {
    e.preventDefault();
    const mailSubject = encodeURIComponent(
      subject.trim() || `Portfolio Inquiry from ${senderName.trim() || 'Visitor'}`
    );
    const bodyLines = [
      `Name: ${senderName.trim() || 'N/A'}`,
      `Reply Email: ${senderEmail.trim() || 'N/A'}`,
      '',
      message.trim(),
    ];
    const mailBody = encodeURIComponent(bodyLines.join('\n'));
    window.location.href = `mailto:${PROFILE.email}?subject=${mailSubject}&body=${mailBody}`;
    setSubmittedNotice(true);
    window.setTimeout(() => setSubmittedNotice(false), 4000);
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">04 // INITIATE CONNECTION</div>
            <h2 className="section-title">
              GET IN <span className="section-title-outline">TOUCH</span>
            </h2>
          </div>
          <p className="section-subtitle">
            Open for full-stack software developer roles, freelance web systems, and
            technical collaboration.
          </p>
        </div>

        <div className="contact-grid">
          <div className="surface-card contact-panel">
            <div>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.35rem' }}>
                Let&apos;s build something solid.
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Whether you are looking for an engineer who understands both system
                operations and modern full-stack web architecture, or want to collaborate on
                an AI-enabled project — drop a line anytime.
              </p>
            </div>

            <div>
              <div className="meta-cell-label" style={{ marginBottom: '0.5rem' }}>
                DIRECT EMAIL
              </div>
              <div className="contact-email-box">
                <a href={`mailto:${PROFILE.email}`} className="contact-email-text">
                  {PROFILE.email}
                </a>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ padding: '0.48rem 0.8rem' }}
                  onClick={handleCopyEmail}
                >
                  {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            <div>
              <div className="meta-cell-label" style={{ marginBottom: '0.6rem' }}>
                SOCIAL CHANNELS
              </div>
              <div className="social-row">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="social-tile"
                  >
                    <div className="social-tile-name">
                      {item.name} <ArrowUpRight size={11} style={{ display: 'inline' }} />
                    </div>
                    <div className="social-tile-handle">{item.handle}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card contact-panel">
            <form className="contact-form" onSubmit={handleComposeMail}>
              <div className="form-row">
                <div>
                  <label htmlFor="contact-name" className="field-label">
                    YOUR NAME
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    className="field-input"
                    placeholder="Alex Mercer"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="field-label">
                    YOUR EMAIL
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="field-input"
                    placeholder="you@company.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="field-label">
                  SUBJECT
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  className="field-input"
                  placeholder="Full-Stack Role / Project Collaboration"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="field-label">
                  MESSAGE
                </label>
                <textarea
                  id="contact-message"
                  className="field-textarea"
                  placeholder="Tell me about your team, project scope, or timeline..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  marginTop: '0.25rem',
                }}
              >
                <button type="submit" className="btn-primary">
                  <Send size={14} />
                  <span>OPEN IN MAIL CLIENT</span>
                </button>

                <a href={`mailto:${PROFILE.email}`} className="inline-link">
                  <Mail size={14} />
                  <span>QUICK MAILTO</span>
                </a>
              </div>

              {submittedNotice && (
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.74rem',
                    color: '#22c55e',
                  }}
                >
                  Draft prepared in your default mail client ({PROFILE.email}).
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
