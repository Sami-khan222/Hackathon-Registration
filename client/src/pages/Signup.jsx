import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import AuthCard from '../components/AuthCard';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { Input } from '../components/Field';
import * as authService from '../services/authService';
import { parseApiError } from '../services/api';
import { emailError, nameError, passwordError } from '../utils/validation';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = {
      fullName: nameError(form.fullName),
      email: emailError(form.email),
      password: passwordError(form.password),
      confirmPassword: form.password === form.confirmPassword ? '' : 'Passwords do not match.',
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await authService.signup(form);
      sessionStorage.setItem('pendingVerificationEmail', data.email);
      navigate('/verify-otp', { state: { email: data.email, resendIn: data.resendAvailableInSeconds, justSignedUp: true } });
    } catch (err) {
      const info = parseApiError(err);
      setErrors(info.fieldErrors);
      setFormError(Object.keys(info.fieldErrors).length ? '' : info.message);
      // Account exists but email could not be sent / is unverified: send them to the code screen
      if (info.data?.resendAvailableInSeconds !== undefined && info.status !== 422) {
        sessionStorage.setItem('pendingVerificationEmail', form.email.trim().toLowerCase());
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="We’ll email a 6-digit code to confirm it’s you."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert type="error">{formError}</Alert>
        <Input label="Full name" icon={User} autoComplete="name" value={form.fullName} onChange={update('fullName')} error={errors.fullName} placeholder="Asha Verma" />
        <Input label="Email" type="email" icon={Mail} autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} placeholder="you@college.edu" />
        <Input label="Password" type="password" icon={Lock} autoComplete="new-password" value={form.password} onChange={update('password')} error={errors.password} hint="8+ characters with upper and lower case letters and a number." />
        <Input label="Confirm password" type="password" icon={Lock} autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} />
        <Button type="submit" size="lg" className="w-full" loading={submitting}>{submitting ? 'Creating account…' : 'Create account'}</Button>
      </form>
    </AuthCard>
  );
}
