import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Logo from './Logo';
import { CONTACT_EMAIL, SOCIAL_LINKS } from '../utils/eventConfig';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            MatruCare AI builds AI tools that help families and clinicians through pregnancy and early motherhood. The hackathon is how we meet the students who will build what comes next.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Quick links</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact'], ['/signup', 'Register for the hackathon'], ['/login', 'Log in']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-white">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Get in touch</h2>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-4 inline-flex items-center gap-2 text-sm hover:text-white">
            <Mail className="h-4 w-4" aria-hidden="true" />{CONTACT_EMAIL}
          </a>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer noopener" className="hover:text-white">{s.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs sm:px-6">
        © {new Date().getFullYear()} MatruCare AI. All rights reserved.
      </div>
    </footer>
  );
}
