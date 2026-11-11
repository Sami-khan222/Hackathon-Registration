import { Mail, User } from 'lucide-react';
import { Input } from './Field';

/** Renders one Name + Email block per team member; the parent keeps the array in sync with Team Size. */
export default function TeamMemberFields({ members, errors = [], onChange }) {
  if (!members.length) return null;
  return (
    <div className="space-y-4" aria-live="polite">
      {members.map((member, index) => (
        <fieldset key={index} className="rounded-2xl border border-line bg-surface p-5">
          <legend className="px-2 text-sm font-semibold text-navy-900">Team member {index + 1}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Member name" icon={User} value={member.name} autoComplete="off"
              onChange={(e) => onChange(index, 'name', e.target.value)} error={errors?.[index]?.name}
            />
            <Input
              label="Member email" type="email" icon={Mail} value={member.email} autoComplete="off"
              onChange={(e) => onChange(index, 'email', e.target.value)} error={errors?.[index]?.email}
            />
          </div>
        </fieldset>
      ))}
    </div>
  );
}
