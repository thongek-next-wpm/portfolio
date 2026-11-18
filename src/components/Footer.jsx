import { ArrowUp } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-copy">
          <span className="footer-orb-dot" aria-hidden="true" />
          <span>
            {PROFILE.monogram}. &mdash; {PROFILE.firstName} &ldquo;{PROFILE.nickname}&rdquo;{' '}
            {PROFILE.lastName} // {PROFILE.location}
          </span>
        </div>

        <a href="#top" className="footer-top-orb">
          <span>BACK TO TOP</span>
          <span className="footer-top-badge" aria-hidden="true">
            <ArrowUp size={13} />
          </span>
        </a>
      </div>
    </footer>
  );
}
