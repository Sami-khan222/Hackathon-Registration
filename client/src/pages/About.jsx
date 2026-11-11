import { HeartPulse, LineChart, Lock } from 'lucide-react';
import Button from '../components/Button';

const principles = [
  { icon: HeartPulse, title: 'Clinically grounded', text: 'We build with doctors and midwives in the room, so features reflect how care is delivered in practice.' },
  { icon: LineChart, title: 'Useful before clever', text: 'A model only matters if it helps a mother or clinician make a better decision, sooner.' },
  { icon: Lock, title: 'Private by default', text: 'Health data is personal. We collect the minimum and protect it as if it were our own family’s.' },
];

export default function About() {
  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <h1 className="text-4xl font-semibold sm:text-5xl">We build AI for the first thousand days.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            MatruCare AI is a maternal health technology company. Our tools help expecting mothers understand their health and help care teams notice risks earlier.
          </p>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-semibold">Why a hackathon?</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-navy-200">
            The best ideas often come from people outside the problem. Students bring fresh tools and fewer assumptions, and we bring the clinical context. We hire from this hackathon.
          </p>
          <Button to="/signup" variant="light" size="lg" className="mt-8">Join the hackathon</Button>
        </div>
      </section>
    </>
  );
}
