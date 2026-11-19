import { useEffect, useRef } from 'react';
import { ExternalLink, Github, Star, X } from 'lucide-react';
import { formatShortDate } from '../utils/githubSync';

export default function ProjectModal({ project, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!project) return undefined;

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
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div className="aero-window modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="aero-window-titlebar modal-titlebar">
          <div className="aero-window-caption">
            <span className="aero-jewel aqua" aria-hidden="true" />
            <span>
              PROJECT_{project.index} // {project.category}
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close project details"
          >
            <X size={16} />
          </button>
        </div>

        <div className="aero-window-body modal-body">
          <div className="modal-header">
            <div>
              <h3 id="project-modal-title" className="project-title" style={{ fontSize: '1.6rem' }}>
                {project.title}
              </h3>
              <div className="project-subtitle" style={{ marginBottom: 0 }}>
                {project.subtitle}
              </div>
              {(project.pushedAt || project.stars > 0) && (
                <div className="project-meta-telemetry" style={{ marginTop: '0.45rem', marginBottom: 0 }}>
                  {project.pushedAt && (
                    <span>Last pushed {formatShortDate(project.pushedAt)}</span>
                  )}
                  {project.stars > 0 && (
                    <span className="project-stars">
                      <Star size={11} />
                      <span>{project.stars} stars</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <p
            style={{
              color: 'var(--text-secondary)',
              marginTop: 0,
              marginBottom: '1.1rem',
              fontSize: '0.94rem',
            }}
          >
            {project.description}
          </p>

          <div className="meta-cell-label" style={{ marginBottom: '0.5rem' }}>
            ARCHITECTURE &amp; HIGHLIGHTS
          </div>
          <ul className="highlight-list">
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="meta-cell-label" style={{ marginBottom: '0.5rem' }}>
            TECHNOLOGY STACK
          </div>
          <div className="chip-list" style={{ marginBottom: '1.35rem', marginTop: '0.45rem' }}>
            {project.stack.map((tech) => (
              <span key={tech} className="mono-chip">
                {tech}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <ExternalLink size={15} />
                <span>OPEN LIVE DEPLOYMENT</span>
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <Github size={15} />
                <span>VIEW SOURCE CODE</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
