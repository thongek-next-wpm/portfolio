import { Cpu, Database, Monitor, Server } from 'lucide-react';
import { STACK_CATEGORIES } from '../data/portfolioData';

const STACK_META = {
  frontend: { icon: Monitor, tone: 'aqua' },
  backend: { icon: Database, tone: 'eco' },
  devops: { icon: Server, tone: 'lagoon' },
  ai: { icon: Cpu, tone: 'iris' },
};

export default function StackSection() {
  return (
    <section id="stack" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-kicker">03 // TECHNICAL ARSENAL</div>
            <h2 className="section-title">
              TECH <span className="section-title-outline">STACK</span>
            </h2>
          </div>
          <p className="section-subtitle">
            Tools and platforms I use across frontend interfaces, relational backends,
            enterprise IT operations, and AI automation.
          </p>
        </div>

        <div className="stack-grid">
          {STACK_CATEGORIES.map((group) => {
            const meta = STACK_META[group.id] || { icon: Monitor, tone: 'aqua' };
            const IconComponent = meta.icon;

            return (
              <article key={group.id} className="aero-window stack-window">
                <div className="aero-window-titlebar">
                  <div className="aero-window-caption">
                    <span className={`aero-jewel ${meta.tone}`} aria-hidden="true" />
                    <span>MODULE_{group.code}</span>
                  </div>
                  <span className="aero-window-tag">{group.items.length} TOOLS</span>
                </div>

                <div className="aero-window-body stack-card">
                  <div className="stack-card-head">
                    <div className="stack-head-left">
                      <div className={`aero-orb-icon ${meta.tone}`} aria-hidden="true">
                        <IconComponent size={18} />
                      </div>
                      <h3 className="stack-title">{group.title}</h3>
                    </div>
                    <span className="stack-code">// {group.code}</span>
                  </div>
                  <p className="stack-desc">{group.description}</p>
                  <div className="chip-list">
                    {group.items.map((item) => (
                      <span key={item} className="stack-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
