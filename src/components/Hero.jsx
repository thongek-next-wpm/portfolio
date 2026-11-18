import { ArrowDown, ArrowRight, Code2, Droplets, Github, Layers, Users } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';
import AeroOrbGlobe from './AeroOrbGlobe';

export default function Hero({ theme, githubStats }) {
  const displayStats = [
    {
      value: String(githubStats.repos).padStart(2, '0'),
      label: 'PUBLIC REPOS',
      tone: 'aqua',
      icon: Code2,
    },
    {
      value: String(githubStats.followers),
      label: 'GITHUB FOLLOWERS',
      tone: 'eco',
      icon: Users,
    },
    {
      value: `${PROFILE.baselineStats.stackCount}+`,
      label: 'TECH STACK',
      tone: 'lagoon',
      icon: Layers,
    },
  ];

  return (
    <section id="top" className="hero">
      <div className="hero-globe-layer">
        <AeroOrbGlobe theme={theme} />
      </div>

      {/* Layered Frutiger Aero sunlit horizon waves */}
      <div className="hero-horizon-waves" aria-hidden="true">
        <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className="hero-wave-svg">
          <defs>
            <linearGradient id="waveBackGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--wave-back-1)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--wave-back-2)" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="waveFrontGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--wave-front-1)" stopOpacity="0.72" />
              <stop offset="100%" stopColor="var(--wave-front-2)" stopOpacity="0.92" />
            </linearGradient>
          </defs>
          <path
            d="M0,128 C240,68 460,185 760,122 C1060,58 1240,156 1440,104 L1440,240 L0,240 Z"
            fill="url(#waveBackGrad)"
          />
          <path
            d="M0,164 C280,214 540,102 860,162 C1120,210 1290,126 1440,158 L1440,240 L0,240 Z"
            fill="url(#waveFrontGrad)"
          />
          <path
            d="M0,164 C280,214 540,102 860,162 C1120,210 1290,126 1440,158"
            fill="none"
            stroke="rgba(255,255,255,0.68)"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      <div className="container hero-content">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="aero-orb-badge" aria-hidden="true">
              <Droplets size={12} />
            </span>
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

          <div className="hero-bio-panel">
            <a
              href="#about"
              className="hero-droplet-trigger"
              aria-label="Scroll to About section"
              title="Explore About Me"
            >
              <ArrowDown size={15} />
            </a>
            <p className="hero-bio">{PROFILE.heroBio}</p>
          </div>

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
          {displayStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} className="aero-gadget-card">
                <div className={`aero-orb-icon ${stat.tone}`} aria-hidden="true">
                  <IconComponent size={17} />
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </aside>
      </div>

      <div className="hero-bottom-bar">
        <div className="hero-progress-track">
          <div className="hero-progress-line" />
        </div>
        <span className="hero-scroll-hint">DRAG BIOSPHERE // SCROLL TO EXPLORE</span>
      </div>
    </section>
  );
}
