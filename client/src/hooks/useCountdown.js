import { useCallback, useEffect, useState } from 'react';

/** Counts down once per second from the value passed to start(). Used for the OTP resend cooldown and expiry. */
export default function useCountdown(initialSeconds = 0) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const id = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const start = useCallback((seconds) => setRemaining(seconds), []);
  return { remaining, start };
}
