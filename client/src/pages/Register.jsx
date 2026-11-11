import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { Input, Select } from '../components/Field';
import PageLoader from '../components/PageLoader';
import ParticipantPass from '../components/ParticipantPass';
import TeamMemberFields from '../components/TeamMemberFields';
import { useAuth } from '../context/AuthContext';
import * as hackathonService from '../services/hackathonService';
import { parseApiError } from '../services/api';
import { emailError, memberCountFor, mobileError, nameError, urlError } from '../utils/validation';

const emptyMember = () => ({ name: '', email: '' });

export default function Register() {
  const { user, setIsRegistered } = useAuth();
  const [options, setOptions] = useState(null);
  const [existing, setExisting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({
    fullName: user?.fullName || '', email: user?.email || '', mobileNumber: '',
    collegeName: '', course: '', branch: '', yearOfStudy: '', domain: '',
    projectName: '', pptLink: '', prototypeLink: '', demoVideoLink: '', teamSize: '1',
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Load dropdown options (single source of truth lives on the server) and check for an existing entry
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [opts, entry] = await Promise.all([hackathonService.getOptions(), hackathonService.getMyEntry()]);
        if (cancelled) return;
        setOptions(opts.data);
        setExisting(Boolean(entry.data.registration));
      } catch (err) {
        if (!cancelled) setLoadError(parseApiError(err).message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const clearError = (field) => errors[field] && setErrors((prev) => ({ ...prev, [field]: '' }));
  const update = (field) => (e) => { setForm((f) => ({ ...f, [field]: e.target.value })); clearError(field); };

  const handleMobile = (e) => {
    setForm((f) => ({ ...f, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }));
    clearError('mobileNumber');
  };

  /** Team size drives the number of member entries; already typed values are kept. */
  const handleTeamSize = (e) => {
    const size = e.target.value;
    setForm((f) => ({ ...f, teamSize: size }));
    setTeamMembers((prev) => Array.from({ length: memberCountFor(size) }, (_, i) => prev[i] || emptyMember()));
    clearError('teamSize'); clearError('teamMembers');
  };

  const handleMemberChange = (index, field, value) => {
    setTeamMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
    if (Array.isArray(errors.teamMembers)) {
      setErrors((prev) => ({ ...prev, teamMembers: prev.teamMembers.map((e, i) => (i === index ? { ...e, [field]: '' } : e)) }));
    }
  };

  const validate = () => {
    const next = {
      fullName: nameError(form.fullName),
      email: emailError(form.email, 'Email address'),
      mobileNumber: mobileError(form.mobileNumber),
      collegeName: form.collegeName ? '' : 'Select your college.',
      course: form.course ? '' : 'Select your course.',
      branch: form.branch ? '' : 'Select your branch.',
      yearOfStudy: form.yearOfStudy ? '' : 'Select your year of study.',
      domain: form.domain ? '' : 'Select a domain or track.',
      projectName: form.projectName.trim().length >= 5 ? '' : 'Project name must be at least 5 characters.',
      pptLink: urlError(form.pptLink, 'PPT link', { driveOnly: true }),
      prototypeLink: urlError(form.prototypeLink, 'Prototype link'),
      demoVideoLink: urlError(form.demoVideoLink, 'Demo video link', { required: false }),
    };
    const seen = new Set([form.email.trim().toLowerCase()]);
    const memberErrors = teamMembers.map((m) => {
      const email = m.email.trim().toLowerCase();
      let emailMsg = emailError(m.email, 'Member email');
      if (!emailMsg && seen.has(email)) emailMsg = 'Each team member needs a unique email.';
      seen.add(email);
      return { name: nameError(m.name, 'Member name'), email: emailMsg };
    });
    if (memberErrors.some((m) => m.name || m.email)) next.teamMembers = memberErrors;
    setErrors(next);
    return !Object.values(next).some((v) => (Array.isArray(v) ? v.length : v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) {
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await hackathonService.registerForHackathon({ ...form, teamSize: Number(form.teamSize), teamMembers });
      setIsRegistered(true);
      setResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const info = parseApiError(err);
      setErrors(info.fieldErrors);
      setFormError(Object.keys(info.fieldErrors).length ? 'Some fields need your attention.' : info.message);
      if (info.status === 409) setExisting(true);
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return <div className="mx-auto max-w-xl px-4 py-16"><Alert type="error">{loadError}</Alert><Button className="mt-4" onClick={() => window.location.reload()}>Try again</Button></div>;
  }
  if (!options) return <PageLoader label="Loading the registration form…" />;

  if (result) {
    return (
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-7 w-7" /></span>
          <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">You’re registered, {result.registration.fullName.split(' ')[0]}.</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            {result.emailSent ? `A confirmation email is on its way to ${user.email}.` : 'Your registration is saved, but we could not send the confirmation email. You can see everything on your dashboard.'}
          </p>
          <div className="mt-10"><ParticipantPass registration={result.registration} /></div>
          <Button to="/dashboard" size="lg" className="mt-10">Go to dashboard</Button>
        </div>
      </section>
    );
  }

  if (existing) {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold">You’ve already registered</h1>
        <p className="mt-3 text-muted">Each participant can register once. You can review or withdraw your registration from the dashboard.</p>
        <Button to="/dashboard" className="mt-8">View my registration</Button>
      </section>
    );
  }

  const teamSizeOptions = options.teamSizes.map((n) => ({ value: String(n), label: n === 1 ? '1 (solo)' : String(n) }));

  return (
    <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Register for the hackathon</h1>
        <p className="mt-3 text-muted">All fields are required unless marked optional. <Link to="/dashboard" className="font-semibold text-brand-600 hover:underline">Back to dashboard</Link></p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
          {formError && <Alert type="error">{formError}</Alert>}

          <FormSection title="About you">
            <Input label="Full name" value={form.fullName} onChange={update('fullName')} error={errors.fullName} autoComplete="name" />
            <Input label="Email address" type="email" value={form.email} readOnly error={errors.email} hint="From your verified account." className="bg-surface" />
            <Input label="Mobile number" type="tel" inputMode="numeric" value={form.mobileNumber} onChange={handleMobile} error={errors.mobileNumber} placeholder="10-digit number" autoComplete="tel-national" />
          </FormSection>

          <FormSection title="Education">
            <Select label="College name" options={options.colleges} value={form.collegeName} onChange={update('collegeName')} error={errors.collegeName} className="sm:col-span-2" />
            <Select label="Course" options={options.courses} value={form.course} onChange={update('course')} error={errors.course} />
            <Select label="Branch" options={options.branches} value={form.branch} onChange={update('branch')} error={errors.branch} />
            <Select label="Year of study" options={options.yearsOfStudy} value={form.yearOfStudy} onChange={update('yearOfStudy')} error={errors.yearOfStudy} />
          </FormSection>

          <FormSection title="Your project">
            <Select label="Domain / track" options={options.domains} value={form.domain} onChange={update('domain')} error={errors.domain} />
            <Input label="Project name" value={form.projectName} onChange={update('projectName')} error={errors.projectName} />
            <Input label="PPT link" type="url" value={form.pptLink} onChange={update('pptLink')} error={errors.pptLink} placeholder="https://drive.google.com/…" hint="Google Drive or OneDrive link, set to ‘anyone with the link can view’." />
            <Input label="Prototype link" type="url" value={form.prototypeLink} onChange={update('prototypeLink')} error={errors.prototypeLink} placeholder="https://github.com/…" hint="GitHub, Figma or a live demo." />
            <Input label="Demo video link" type="url" optional value={form.demoVideoLink} onChange={update('demoVideoLink')} error={errors.demoVideoLink} placeholder="https://youtube.com/…" />
          </FormSection>

          <FormSection title="Your team" single>
            <div className="sm:max-w-xs">
              <Select label="Team size" options={teamSizeOptions} placeholder="Select team size" value={form.teamSize} onChange={handleTeamSize} error={errors.teamSize} />
            </div>
            {typeof errors.teamMembers === 'string' && <Alert type="error">{errors.teamMembers}</Alert>}
            {teamMembers.length > 0 && <p className="text-sm text-muted">Add the details for each of your {teamMembers.length} team members.</p>}
            <TeamMemberFields members={teamMembers} errors={Array.isArray(errors.teamMembers) ? errors.teamMembers : []} onChange={handleMemberChange} />
          </FormSection>

          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={submitting}>{submitting ? 'Submitting…' : 'Submit registration'}</Button>
        </form>
      </div>
    </section>
  );
}

function FormSection({ title, children, single = false }) {
  return (
    <fieldset className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
      <legend className="px-2 font-display text-lg font-semibold">{title}</legend>
      <div className={single ? 'space-y-5' : 'grid gap-5 sm:grid-cols-2 [&>*:nth-child(odd):last-child]:sm:col-span-2'}>{children}</div>
    </fieldset>
  );
}
