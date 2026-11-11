import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import AuthCard from '../components/AuthCard';
import Alert from '../components/Alert';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';
import { Input } from '../components/Field';
import useCountdown from '../hooks/useCountdown';
import * as authService from '../services/authService';
import { parseApiError } from '../services/api';
import { emailError } from '../utils/validation';

const OTP_VALIDITY_SECONDS = 10 * 60;
const formatClock = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || sessionStorage.getItem('pendingVerificationEmail') || '');
  const [emailInput, setEmailInput] = useState('');
  const [emailInputError, setEmailInputError] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    state?.justSignedUp ? 'Account created. We sent a 6-digit code to your email.'
      : state?.needsVerification ? 'Your email isn’t verified yet. Request a new code below.' : ''
  );
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  // Resend cooldown (server-enforced, mirrored here) and the 10-minute code lifetime
  const resend = useCountdown(state?.justSignedUp ? state.resendIn ?? 60 : 0);
  const expiry = useCountdown(state?.justSignedUp ? OTP_VALIDITY_SECONDS : 0);

  // After success, send them to Login
  useEffect(() => {
    if (!verified) return undefined;
    const id = setTimeout(() => navigate('/login', { replace: true, state: { verified: true, email } }), 1500);
    return () => clearTimeout(id);
  }, [verified, navigate, email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (otp.length !== 6) { setError('Enter all 6 digits of the code.'); return; }
    setVerifying(true);
    try {
      await authService.verifyOtp({ email, otp });
      sessionStorage.removeItem('pendingVerificationEmail');
      setVerified(true);
    } catch (err) {
      const info = parseApiError(err);
      setError(info.fieldErrors?.otp || info.message);
      if (info.code === 'OTP_EXPIRED') expiry.start(0);
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError(''); setMessage('');
    setResending(true);
    try {
      const { data, message: msg } = await authService.resendOtp({ email });
      setMessage(msg);
      resend.start(data.resendAvailableInSeconds ?? 60);
      expiry.start(OTP_VALIDITY_SECONDS);
      setOtp('');
    } catch (err) {
      const info = parseApiError(err);
      setError(info.message);
      if (info.data?.resendAvailableInSeconds) resend.start(info.data.resendAvailableInSeconds);
    } finally {
      setResending(false);
    }
  };

  // Arrived without an email (e.g. opened the URL directly): ask for it first
  if (!email) {
    const submitEmail = (e) => {
      e.preventDefault();
      const msg = emailError(emailInput);
      setEmailInputError(msg);
      if (!msg) setEmail(emailInput.trim().toLowerCase());
    };
    return (
      <AuthCard title="Verify your email" subtitle="Enter the email you signed up with.">
        <form onSubmit={submitEmail} noValidate className="space-y-4">
          <Input label="Email" type="email" icon={Mail} value={emailInput} onChange={(e) => setEmailInput(e.target.value)} error={emailInputError} />
          <Button type="submit" size="lg" className="w-full">Continue</Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Check your email"
      subtitle={<>Enter the 6-digit code sent to <strong className="text-navy-900">{email}</strong>.</>}
      footer={<>Wrong email? <Link to="/signup" className="font-semibold text-brand-600 hover:underline">Start over</Link></>}
    >
      <form onSubmit={handleVerify} noValidate className="space-y-5">
        {verified ? (
          <Alert type="success">Email verified. Taking you to login…</Alert>
        ) : (
          <>
            <Alert type="success">{message}</Alert>
            <Alert type="error">{error && !error.includes('Enter all') ? error : ''}</Alert>
            <OtpInput value={otp} onChange={setOtp} error={error.includes('Enter all') ? error : ''} disabled={verifying} />
            {expiry.remaining > 0 && (
              <p className="text-center text-xs text-muted">Code expires in <span className="font-semibold tabular-nums text-navy-900">{formatClock(expiry.remaining)}</span></p>
            )}
            <Button type="submit" size="lg" className="w-full" loading={verifying}>{verifying ? 'Verifying…' : 'Verify code'}</Button>
            <div className="text-center text-sm text-muted">
              Didn’t get it?{' '}
              {resend.remaining > 0 ? (
                <span>Resend available in <span className="font-semibold tabular-nums text-navy-900">{resend.remaining}s</span></span>
              ) : (
                <button type="button" onClick={handleResend} disabled={resending} className="font-semibold text-brand-600 hover:underline disabled:opacity-60">
                  {resending ? 'Sending…' : 'Resend code'}
                </button>
              )}
            </div>
          </>
        )}
      </form>
    </AuthCard>
  );
}
