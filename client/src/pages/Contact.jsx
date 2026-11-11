import { useState } from 'react';
import { Mail } from 'lucide-react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { Input, Textarea } from '../components/Field';
import { sendContactMessage } from '../services/hackathonService';
import { parseApiError } from '../services/api';
import { CONTACT_EMAIL } from '../utils/eventConfig';
import { emailError } from '../utils/validation';

const empty = { name: '', email: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    const next = {
      name: form.name.trim().length >= 2 ? '' : 'Enter your name.',
      email: emailError(form.email),
      message: form.message.trim().length >= 10 ? '' : 'Message must be at least 10 characters.',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      const { message } = await sendContactMessage(form);
      setStatus({ type: 'success', text: message });
      setForm(empty);
    } catch (err) {
      const info = parseApiError(err);
      setErrors(info.fieldErrors);
      setStatus({ type: 'error', text: Object.keys(info.fieldErrors).length ? '' : info.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-surface px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h1 className="text-4xl font-semibold">Questions about the hackathon?</h1>
          <p className="mt-4 leading-relaxed text-muted">Ask about eligibility, tracks or your registration. We usually reply within two working days.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-8 inline-flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold shadow-card hover:border-brand-500">
            <Mail className="h-4 w-4 text-brand-500" aria-hidden="true" />{CONTACT_EMAIL}
          </a>
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
          <Alert type={status.type || 'info'}>{status.text}</Alert>
          <Input label="Name" autoComplete="name" value={form.name} onChange={update('name')} error={errors.name} />
          <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
          <Textarea label="Message" value={form.message} onChange={update('message')} error={errors.message} maxLength={2000} />
          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={submitting}>{submitting ? 'Sending…' : 'Send message'}</Button>
        </form>
      </div>
    </section>
  );
}
