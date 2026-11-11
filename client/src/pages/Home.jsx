import { ArrowRight, Brain, ShieldCheck, Stethoscope, Users, Trophy } from 'lucide-react';
import Button from '../components/Button';
import ParticipantPass from '../components/ParticipantPass';
import { useAuth } from '../context/AuthContext';
import { EVENT, HIGHLIGHTS, PRIZES, TIMELINE } from '../utils/eventConfig';

const icons = { Brain, Users, Stethoscope, ShieldCheck };

export default function Home() {
  const { isAuthenticated, isRegistered } = useAuth();
  const primaryCta = isAuthenticated
    ? { to: isRegistered ? '/dashboard' : '/register', label: isRegistered ? 'View my registration' : 'Register now' }
    : { to: '/signup', label: 'Register now' };

  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-600">{EVENT.name} · {EVENT.dates}</p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Build the tools that make pregnancy safer.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Two days, real problems from maternal healthcare, and mentors who work on them every day. Bring a team of up to five and ship a prototype you are proud of.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button to={primaryCta.to} size="lg">{primaryCta.label}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
              {!isAuthenticated && <Button to="/login" variant="secondary" size="lg">Log in</Button>}
              <Button variant="ghost" size="lg" onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })}>See the timeline</Button>
            </div>
          </div>
          <div className="px-2 sm:px-8 lg:px-0"><ParticipantPass animate preview /></div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-surface" aria-labelledby="highlights-heading">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="highlights-heading" className="max-w-2xl text-3xl font-semibold sm:text-4xl">Why this hackathon is different</h2>
          <p className="mt-4 max-w-2xl text-muted">You won’t be building another to-do app. Every problem statement comes from a gap clinicians and mothers have told us about.</p>
          <dl className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {HIGHLIGHTS.map(({ icon, title, text }) => {
              const Icon = icons[icon];
              return (
                <div key={title} className="flex gap-4 border-t border-line pt-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-500 shadow-card"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div>
                    <dt className="font-display text-lg font-semibold">{title}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-muted">{text}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* Timeline: a true sequence, so numbered markers are appropriate */}
      <section id="timeline" className="scroll-mt-16 bg-white" aria-labelledby="timeline-heading">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="timeline-heading" className="text-3xl font-semibold sm:text-4xl">From signup to finale</h2>
            <p className="mt-4 text-muted">Five steps, with email updates at each one. Dates are in IST.</p>
          </div>
          <ol className="relative space-y-8 border-l border-line pl-8">
            {TIMELINE.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">{i + 1}</span>
                <p className="text-sm font-semibold text-brand-600">{step.date}</p>
                <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prizes */}
      <section className="bg-navy-900 text-white" aria-labelledby="prizes-heading">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="prizes-heading" className="max-w-2xl text-3xl font-semibold sm:text-4xl">Prizes worth building for</h2>
          <div className="mt-12 grid items-end gap-5 md:grid-cols-3">
            {PRIZES.map((prize, i) => (
              <div key={prize.place} className={`rounded-2xl p-7 ${i === 0 ? 'bg-white text-navy-900 md:py-12' : 'border border-white/15 bg-white/5'}`}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className={`h-4 w-4 ${i === 0 ? 'text-violet-500' : 'text-navy-300'}`} aria-hidden="true" />{prize.place}
                </div>
                <p className="mt-3 font-display text-4xl font-semibold">{prize.amount}</p>
                <ul className={`mt-5 space-y-2 text-sm ${i === 0 ? 'text-muted' : 'text-navy-200'}`}>
                  {prize.perks.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white" aria-labelledby="about-heading">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 id="about-heading" className="text-3xl font-semibold sm:text-4xl">About MatruCare AI</h2>
            <p className="mt-5 leading-relaxed text-muted">
              MatruCare AI is a healthcare technology company focused on maternal wellbeing. We build AI-assisted tools that help expecting mothers track their health and help clinicians spot risks earlier.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              This hackathon opens our problem space to student builders. The strongest teams get a direct line to our team through internships and mentorship.
            </p>
            <Button to="/about" variant="secondary" className="mt-8">Read more about us</Button>
          </div>
          <div className="rounded-3xl bg-surface p-8">
            <h3 className="text-xl font-semibold">Who can join</h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
              <li>Students enrolled in a diploma, undergraduate or postgraduate programme in India.</li>
              <li>Teams of one to five. You register once as team lead and add the rest of your team.</li>
              <li>Any branch. Healthcare knowledge is welcome but not required.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-brand-500 to-violet-500 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">Your team’s idea could reach real mothers.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">Registration takes about five minutes. Have your idea deck and prototype link ready.</p>
          <Button to={primaryCta.to} variant="light" size="lg" className="mt-8">{primaryCta.label}</Button>
        </div>
      </section>
    </>
  );
}
