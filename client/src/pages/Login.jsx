import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import AuthCard from '../components/AuthCard';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { Input } from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../services/api';
import { emailError } from '../utils/validation';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const next = { email: emailError(form.email), password: form.password ? '' : 'Password is required.' };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      const info = parseApiError(err);
      if (info.code === 'UNVERIFIED') {
        const email = info.data.email || form.email.trim().toLowerCase();
        sessionStorage.setItem('pendingVerificationEmail', email);
        navigate('/verify-otp', { state: { email, needsVerification: true } });
        return;
      }
      setErrors(info.fieldErrors);
      setFormError(Object.keys(info.fieldErrors).length ? '' : info.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to manage your hackathon registration."
      footer={<>New here? <Link to="/signup" className="font-semibold text-brand-600 hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {location.state?.verified && <Alert type="success">Email verified. Log in to continue.</Alert>}
        <Alert type="error">{formError}</Alert>
        <Input label="Email" type="email" icon={Mail} autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
        <Input label="Password" type="password" icon={Lock} autoComplete="current-password" value={form.password} onChange={update('password')} error={errors.password} />
        <Button type="submit" size="lg" className="w-full" loading={submitting}>{submitting ? 'Logging in…' : 'Log in'}</Button>
      </form>
    </AuthCard>
  );
}
