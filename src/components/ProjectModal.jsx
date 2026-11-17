import { useEffect, useRef } from 'react';
import { ExternalLink, Github, X } from 'lucide-react';

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
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="section-kicker" style={{ marginBottom: '0.35rem' }}>
              PROJECT {project.index} // {project.category}
            </div>
            <h3 id="project-modal-title" className="project-title" style={{ fontSize: '1.55rem' }}>
              {project.title}
            </h3>
            <div className="project-subtitle" style={{ marginBottom: 0 }}>
              {project.subtitle}
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close project details"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1.1rem', fontSize: '0.94rem' }}>
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
  );
}
