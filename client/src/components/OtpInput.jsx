import { useRef } from 'react';

/** Six single-digit boxes with auto-advance, backspace navigation and paste support. */
export default function OtpInput({ value, onChange, error, length = 6, disabled }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const focus = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setDigit = (i, digit) => {
    const next = digits.slice();
    next[i] = digit;
    onChange(next.join(''));
  };

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    setDigit(i, digit);
    if (digit) focus(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i]) { focus(i - 1); }
    if (e.key === 'ArrowLeft') focus(i - 1);
    if (e.key === 'ArrowRight') focus(i + 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focus(pasted.length);
  };

  return (
    <div>
      <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            className={`h-14 w-full min-w-0 rounded-xl border bg-white text-center font-display text-2xl font-semibold focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 ${error ? 'border-red-400' : 'border-line'}`}
          />
        ))}
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
