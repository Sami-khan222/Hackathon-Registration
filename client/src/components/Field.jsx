import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const control = (error) =>
  `w-full rounded-xl border bg-white px-3.5 text-sm text-navy-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:bg-surface disabled:text-muted ${
    error ? 'border-red-400' : 'border-line hover:border-navy-300'
  }`;

/** Label + control + hint/error, wired together for screen readers. */
function FieldShell({ id, label, error, hint, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-navy-900">
        <span>{label}</span>
        {optional && <span className="text-xs font-medium text-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, error, hint, optional, icon: Icon, type = 'text', className = '', ...props }, ref) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />}
        <input
          ref={ref}
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${control(error)} h-11 ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-11' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-navy-900"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </FieldShell>
  );
});

export const Select = forwardRef(function Select({ label, error, hint, optional, options = [], placeholder = 'Select', className = '', ...props }, ref) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional}>
      <select
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${control(error)} h-11 ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
    </FieldShell>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, className = '', ...props }, ref) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${control(error)} min-h-[140px] resize-y py-3 ${className}`}
        {...props}
      />
    </FieldShell>
  );
});
