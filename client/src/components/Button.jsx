import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60';
const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  dark: 'bg-navy-900 text-white hover:bg-navy-800',
  secondary: 'border border-line bg-white text-navy-900 hover:bg-surface',
  ghost: 'text-navy-900 hover:bg-surface',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
  light: 'bg-white text-navy-900 hover:bg-brand-50',
};
const sizes = { md: 'h-11 px-5 text-sm', lg: 'h-12 px-6 text-base', sm: 'h-9 px-3.5 text-sm' };

/** Renders a router <Link> when `to` is passed, otherwise a <button>. */
export default function Button({ to, variant = 'primary', size = 'md', loading = false, className = '', children, ...props }) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>;
  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
