import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Copy, Mail, X } from 'lucide-react';
import { PROFILE, SOCIAL_LINKS } from '../data/portfolioData';

export default function HireModal({ open, onClose }) {
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hire-modal-title"
      onClick={onClose}
    >
      <div
        className="modal-panel"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="section-kicker" style={{ marginBottom: '0.35rem' }}>
              AVAILABLE FOR WORK
            </div>
            <h3 id="hire-modal-title" className="project-title" style={{ fontSize: '1.55rem' }}>
              HIRE THONGEK &ldquo;{PROFILE.nickname}&rdquo; WONGPOMON
            </h3>
            <div className="project-subtitle" style={{ marginBottom: 0 }}>
              {PROFILE.roleEyebrow} &bull; {PROFILE.location}
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close hire dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Open to Software Developer (Full-Stack / Frontend / Backend), IT Systems, and
          AI-powered web engineering roles. Reach out directly via email or social channels.
        </p>

        <div className="contact-email-box" style={{ marginBottom: '1.25rem' }}>
          <span className="contact-email-text">{PROFILE.email}</span>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '0.45rem 0.8rem' }}
            onClick={handleCopy}
          >
            {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.35rem' }}>
          <a href={`mailto:${PROFILE.email}`} className="btn-primary">
            <Mail size={15} />
            <span>SEND EMAIL</span>
          </a>
          <a
            href="#contact"
            className="btn-ghost"
            onClick={onClose}
          >
            <span>USE CONTACT FORM</span>
          </a>
        </div>

        <div className="meta-cell-label" style={{ marginBottom: '0.5rem' }}>
          PROFILES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-link"
            >
              <span>{link.name}</span>
              <ArrowUpRight size={13} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
