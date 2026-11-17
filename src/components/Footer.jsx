import { ArrowUp } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-copy">
          {PROFILE.monogram}. &mdash; {PROFILE.firstName} &ldquo;{PROFILE.nickname}&rdquo;{' '}
          {PROFILE.lastName} // {PROFILE.location}
        </div>

        <a href="#top" className="inline-link">
          <span>BACK TO TOP</span>
          <ArrowUp size={14} />
        </a>
      </div>
    </footer>
  );
}
