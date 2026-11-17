import { STACK_CATEGORIES } from '../data/portfolioData';

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
          {STACK_CATEGORIES.map((group) => (
            <article key={group.id} className="surface-card stack-card">
              <div className="stack-card-head">
                <h3 className="stack-title">{group.title}</h3>
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
