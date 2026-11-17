import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS, PROFILE } from '../data/portfolioData';

export default function Navbar({ onOpenHireModal }) {
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
        <div className="container navbar-inner">
          <a href="#top" className="brand-mark" aria-label="Thongek Wongpomon Home">
            <span>
              {PROFILE.monogram}
              <span className="brand-dot">.</span>
            </span>
            <span className="brand-alias">// {PROFILE.nickname}</span>
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
            <button
              type="button"
              className="btn-hire"
              onClick={onOpenHireModal}
            >
              HIRE ME
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
      </header>

      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
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
          HIRE ME
        </button>
      </div>
    </>
  );
}
