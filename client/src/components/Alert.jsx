import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const styles = {
  error: { box: 'border-red-200 bg-red-50 text-red-800', Icon: AlertCircle },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 },
  info: { box: 'border-brand-100 bg-brand-50 text-navy-900', Icon: Info },
};

export default function Alert({ type = 'info', children, className = '' }) {
  if (!children) return null;
  const { box, Icon } = styles[type];
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${box} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
