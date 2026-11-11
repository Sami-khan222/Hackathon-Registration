import { useEffect, useState } from 'react';
import { BadgeCheck, CalendarDays, ExternalLink, MapPin, Pencil } from 'lucide-react';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import { Input } from '../components/Field';
import PageLoader from '../components/PageLoader';
import ParticipantPass from '../components/ParticipantPass';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';
import * as hackathonService from '../services/hackathonService';
import { parseApiError } from '../services/api';
import { EVENT } from '../utils/eventConfig';
import { nameError } from '../utils/validation';

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Dashboard() {
  const { user, setUser, setIsRegistered } = useAuth();
  const [registration, setRegistration] = useState(undefined); // undefined = loading, null = none
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.fullName);
  const [nameErr, setNameErr] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hackathonService.getMyEntry()
      .then(({ data }) => setRegistration(data.registration))
      .catch((err) => { setError(parseApiError(err).message); setRegistration(null); });
  }, []);

  const saveName = async () => {
    const msg = nameError(nameDraft);
    setNameErr(msg);
    if (msg) return;
    setBusy(true);
    try {
      const { data } = await authService.updateProfile({ fullName: nameDraft });
      setUser(data.user);
      setEditing(false);
      setNotice('Profile updated.');
    } catch (err) {
      const info = parseApiError(err);
      setNameErr(info.fieldErrors.fullName || info.message);
    } finally { setBusy(false); }
  };

  const withdraw = async () => {
    setBusy(true); setError('');
    try {
      await hackathonService.deleteEntry(registration._id);
      setRegistration(null);
      setIsRegistered(false);
      setConfirmingDelete(false);
      setNotice('Your registration was withdrawn. You can register again any time before the deadline.');
    } catch (err) {
      setError(parseApiError(err).message);
    } finally { setBusy(false); }
  };

  if (registration === undefined) return <PageLoader label="Loading your dashboard…" />;

  return (
    <section className="bg-surface px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Welcome, {user.fullName.split(' ')[0]}</h1>
        <p className="mt-2 text-muted">Here’s your profile and where your hackathon registration stands.</p>

        <div className="mt-6 space-y-3">
          <Alert type="success">{notice}</Alert>
          <Alert type="error">{error}</Alert>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">Profile</h2>
                {!editing && <Button variant="ghost" size="sm" onClick={() => { setNameDraft(user.fullName); setEditing(true); }}><Pencil className="h-3.5 w-3.5" />Edit name</Button>}
              </div>
              {editing ? (
                <div className="mt-4 space-y-3">
                  <Input label="Full name" value={nameDraft} onChange={(e) => { setNameDraft(e.target.value); setNameErr(''); }} error={nameErr} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveName} loading={busy}>Save</Button>
                    <Button size="sm" variant="secondary" onClick={() => { setEditing(false); setNameErr(''); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Name" value={user.fullName} />
                  <Row label="Email" value={user.email} />
                  <Row label="Member since" value={formatDate(user.createdAt)} />
                  <div className="flex items-center justify-between"><dt className="text-muted">Account</dt><dd><Badge tone="success" icon={BadgeCheck}>Email verified</Badge></dd></div>
                </dl>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold">Hackathon details</h2>
              <p className="mt-3 font-display text-xl font-semibold">{EVENT.name}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand-500" />{EVENT.dates}</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-500" />{EVENT.mode}: {EVENT.location}</li>
              </ul>
            </Card>
          </div>

          {registration ? (
            <div className="space-y-6">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Registration status</h2>
                  <Badge tone="success" icon={BadgeCheck}>Registered</Badge>
                </div>
                <div className="mt-6 grid items-center gap-8 md:grid-cols-[1fr_1.1fr]">
                  <ParticipantPass registration={registration} />
                  <dl className="space-y-3 text-sm">
                    <Row label="Project" value={registration.projectName} />
                    <Row label="Domain" value={registration.domain} />
                    <Row label="College" value={registration.collegeName} />
                    <Row label="Course" value={`${registration.course}, ${registration.branch}, ${registration.yearOfStudy}`} />
                    <Row label="Mobile" value={registration.mobileNumber} />
                    <Row label="Registered on" value={formatDate(registration.createdAt)} />
                  </dl>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold">Submission links</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  <LinkRow label="PPT" href={registration.pptLink} />
                  <LinkRow label="Prototype" href={registration.prototypeLink} />
                  {registration.demoVideoLink && <LinkRow label="Demo video" href={registration.demoVideoLink} />}
                </ul>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold">Team ({registration.teamSize === 1 ? 'solo' : `${registration.teamSize} members`})</h2>
                {registration.teamMembers.length ? (
                  <ul className="mt-4 divide-y divide-line text-sm">
                    {registration.teamMembers.map((m) => (
                      <li key={m.email} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-semibold">{m.name}</span><span className="break-all text-muted">{m.email}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-sm text-muted">You’re participating solo.</p>}
              </Card>

              <Card className="flex flex-wrap items-center justify-between gap-4">
                {confirmingDelete ? (
                  <>
                    <p className="text-sm font-medium">Withdraw your registration? This removes your team details.</p>
                    <div className="flex gap-2">
                      <Button variant="danger" size="sm" onClick={withdraw} loading={busy}>Yes, withdraw</Button>
                      <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>Keep it</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted">Need to change something? Withdraw and register again.</p>
                    <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>Withdraw registration</Button>
                  </>
                )}
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col items-start justify-center bg-navy-900 p-8 text-white sm:p-10">
              <Badge tone="warning">Not registered yet</Badge>
              <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">Your team’s spot is waiting.</h2>
              <p className="mt-3 max-w-md leading-relaxed text-navy-200">Register with your project details and teammates. It takes about five minutes, and we’ll email you a confirmation.</p>
              <Button to="/register" variant="light" size="lg" className="mt-8">Register now</Button>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="break-words text-right font-semibold">{value}</dd>
    </div>
  );
}

function LinkRow({ label, href }) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="text-muted">{label}</span>
      <a href={href} target="_blank" rel="noreferrer noopener" className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-brand-600 hover:underline">
        <span className="truncate">{href.replace(/^https:\/\//, '')}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </a>
    </li>
  );
}
