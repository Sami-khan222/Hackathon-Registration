import { CalendarDays, MapPin } from 'lucide-react';
import { EVENT } from '../utils/eventConfig';

/**
 * The signature element: a ticket-style pass. On Home it is a preview; on the Dashboard it shows
 * the participant's real registration (pass `registration`).
 */
export default function ParticipantPass({ registration, name, animate = false, preview = false }) {
  const holder = registration?.fullName || name || 'Your name here';
  const rows = [
    ['Track', registration?.domain || 'Choose at registration'],
    ['Project', registration?.projectName || 'Your idea'],
    ['Team', registration ? (registration.teamSize === 1 ? 'Solo' : `${registration.teamSize} members`) : 'Up to 5'],
  ];
  return (
    <div className={`relative mx-auto w-full max-w-sm rounded-3xl bg-navy-900 text-white shadow-pass ${animate ? 'animate-pass' : ''}`} style={animate ? undefined : { transform: 'rotate(-1.5deg)' }}>
      <div className="p-7 pb-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-navy-300">MatruCare AI</span>
          <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-xs font-semibold text-[#c9bcff]">{preview ? 'Preview' : 'Confirmed'}</span>
        </div>
        <p className="mt-8 text-xs text-navy-300">Participant</p>
        <p className="mt-1 break-words font-display text-2xl font-semibold leading-tight">{holder}</p>
        <p className="mt-5 text-sm font-medium text-navy-200">{EVENT.name}</p>
      </div>

      {/* perforation */}
      <div className="relative">
        <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" />
        <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" />
        <div className="mx-6 border-t-2 border-dashed border-white/15" />
      </div>

      <div className="space-y-3 p-7 pt-6">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-navy-300">{label}</span>
            <span className="text-right font-semibold">{value}</span>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-xs text-navy-300">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{EVENT.dates}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{EVENT.mode}</span>
        </div>
      </div>
    </div>
  );
}
