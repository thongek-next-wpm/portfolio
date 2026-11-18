import { useState } from 'react';
import { ArrowUpRight, ExternalLink, Github, Layers } from 'lucide-react';
import { PROFILE, PROJECTS } from '../data/portfolioData';

const CATEGORIES = ['ALL', ...new Set(PROJECTS.map((project) => project.category))];

function getStatusTone(status) {
  if (status === 'LIVE DEMO' || status === 'DEPLOYED') return 'live';
  if (status === 'PUBLIC REPO') return 'aqua';
  if (status === 'IN DEVELOPMENT') return 'amber';
  return 'muted';
}

export default function WorksSection({ onSelectProject }) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filteredProjects =
    activeCategory === 'ALL'
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === activeCategory);

  return (
    <section id="works" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">02 // SELECTED ENGINEERING</div>
            <h2 className="section-title">
              FEATURED <span className="section-title-outline">WORKS</span>
            </h2>
          </div>

          <div className="filter-bar" role="tablist" aria-label="Filter projects">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                className={`filter-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const statusTone = getStatusTone(project.status);

            return (
              <article key={project.id} className="aero-window project-card">
                <div className="aero-window-titlebar">
                  <div className="aero-window-caption">
                    <span className="project-index-pill">{project.index}</span>
                    <span>{project.category}</span>
                  </div>
                  <span className={`project-status ${statusTone}`}>
                    <span className="status-mini-dot" aria-hidden="true" />
                    <span>{project.status}</span>
                  </span>
                </div>

                <div className="aero-window-body project-card-body">
                  <div>
                    <h3 className="project-title">{project.title}</h3>
                    <div className="project-subtitle">{project.subtitle}</div>
                    <p className="project-summary">{project.summary}</p>

                    <div className="chip-list">
                      {project.stack.slice(0, 5).map((tech) => (
                        <span key={tech} className="mono-chip">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="project-footer">
                    <button
                      type="button"
                      className="inline-link"
                      onClick={() => onSelectProject(project)}
                    >
                      <Layers size={14} />
                      <span>ARCHITECTURE</span>
                    </button>

                    <div className="project-links">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-link"
                          aria-label={`${project.title} GitHub repository`}
                        >
                          <Github size={14} />
                          <span>CODE</span>
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-link"
                          aria-label={`${project.title} live demo`}
                        >
                          <ExternalLink size={14} />
                          <span>LIVE</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="works-bottom-cta">
          <a
            href={`${PROFILE.githubUrl}?tab=repositories`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            <span>EXPLORE ALL REPOSITORIES ON GITHUB</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
