import { useEffect, useState } from 'react';
import { Menu, Sparkles, X } from 'lucide-react';
import { NAV_LINKS, PROFILE } from '../data/portfolioData';
import { AERO_THEMES } from '../data/aeroThemes';

export default function Navbar({ aeroTheme, onChangeTheme, onOpenHireModal }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 28);

      const offsets = NAV_LINKS.map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return { id: item.id, top: Infinity };
        return { id: item.id, top: Math.abs(el.getBoundingClientRect().top - 140) };
      });

      if (window.scrollY < 260) {
        setActiveId('');
        return;
      }

      offsets.sort((a, b) => a.top - b.top);
      if (offsets[0]) setActiveId(offsets[0].id);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-dock-wrap">
          <div className="navbar-dock">
            <a href="#top" className="brand-mark" aria-label="Thongek Wongpomon Home">
              <span className="brand-orb" aria-hidden="true">
                {PROFILE.monogram}
              </span>
              <span className="brand-text-group">
                <span className="brand-word">
                  {PROFILE.monogram}
                  <span className="brand-dot">.</span>
                </span>
                <span className="brand-alias">// {PROFILE.nickname}</span>
              </span>
            </a>

            <nav className="nav-links" aria-label="Primary Navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`nav-link ${activeId === link.id ? 'active' : ''}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="nav-actions">
              <div className="aero-theme-switcher" role="group" aria-label="Atmosphere palette">
                {AERO_THEMES.map((item) => {
                  const active = aeroTheme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`aero-theme-btn ${active ? 'active' : ''}`}
                      onClick={() => onChangeTheme(item.id)}
                      title={`Switch to ${item.label} atmosphere`}
                      aria-pressed={active}
                    >
                      <span
                        className="aero-theme-swatch"
                        style={{ background: item.swatch }}
                        aria-hidden="true"
                      />
                      <span className="aero-theme-name">{item.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn-hire"
                onClick={onOpenHireModal}
              >
                <Sparkles size={13} />
                <span>HIRE ME</span>
              </button>

              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-theme-row">
          <span className="meta-cell-label" style={{ marginBottom: 0 }}>
            ATMOSPHERE
          </span>
          <div className="aero-theme-switcher">
            {AERO_THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`aero-theme-btn ${aeroTheme === item.id ? 'active' : ''}`}
                onClick={() => onChangeTheme(item.id)}
                aria-pressed={aeroTheme === item.id}
              >
                <span
                  className="aero-theme-swatch"
                  style={{ background: item.swatch }}
                  aria-hidden="true"
                />
                <span>{item.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={`nav-link ${activeId === link.id ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            {link.label}
          </a>
        ))}

        <button
          type="button"
          className="btn-hire"
          onClick={() => {
            setMenuOpen(false);
            onOpenHireModal();
          }}
        >
          <Sparkles size={13} />
          <span>HIRE ME</span>
        </button>
      </div>
    </>
  );
}
