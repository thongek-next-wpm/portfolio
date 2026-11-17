import { ArrowRight, Github } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';
import WireframeGlobe from './WireframeGlobe';

export default function Hero({ githubStats }) {
  const displayStats = [
    {
      value: String(githubStats.repos).padStart(2, '0'),
      label: 'PUBLIC REPOS +',
    },
    {
      value: String(githubStats.followers),
      label: 'GITHUB FOLLOWERS +',
    },
    {
      value: `${PROFILE.baselineStats.stackCount}+`,
      label: 'TECH STACK +',
    },
  ];

  return (
    <section id="top" className="hero">
      <div className="hero-globe-layer">
        <WireframeGlobe />
      </div>

      <div className="container hero-content">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-line" />
            <span>{PROFILE.roleEyebrow}</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-name-outline">{PROFILE.firstName}</span>
            <span className="hero-name-solid">{PROFILE.lastName}</span>
          </h1>

          <div className="hero-meta-strip">
            <span className="status-pill">
              <span className="status-dot" />
              <span>AVAILABLE FOR OPPORTUNITIES</span>
            </span>
            <span className="status-pill">{PROFILE.location}</span>
          </div>

          <a
            href="#about"
            className="hero-square-trigger"
            aria-label="Scroll to About section"
            title="Explore About Me"
          />

          <p className="hero-bio">{PROFILE.heroBio}</p>

          <div className="hero-actions">
            <a href="#works" className="btn-primary">
              <span>EXPLORE WORKS</span>
              <ArrowRight size={15} />
            </a>
            <a
              href={PROFILE.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              <Github size={15} />
              <span>@{PROFILE.handle}</span>
            </a>
          </div>
        </div>

        <aside className="hero-stats" aria-label="Developer Telemetry">
          {displayStats.map((stat) => (
            <div key={stat.label} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </aside>
      </div>

      <div className="hero-bottom-bar">
        <div className="hero-progress-line" />
        <span className="hero-scroll-hint">DRAG GLOBE // SCROLL TO EXPLORE</span>
      </div>
    </section>
  );
}
