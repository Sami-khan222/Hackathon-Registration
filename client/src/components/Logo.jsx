import { Link } from 'react-router-dom';

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="MatruCare AI home">
      <img src="/favicon.svg" alt="" className="h-8 w-8" />
      <span className={`font-display text-lg font-semibold ${light ? 'text-white' : 'text-navy-900'}`}>MatruCare AI</span>
    </Link>
  );
}
