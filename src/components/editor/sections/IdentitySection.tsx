'use client';
import type { SignatureData } from '@/lib/types';
import Field from '../Field';

type Props = { data: SignatureData; update: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void };

export default function IdentitySection({ data, update }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="section-title">Identity</h3>
      <Field label="Full name">
        <input className="input" value={data.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Jamie Rivers" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Pronouns">
          <input className="input" value={data.pronouns ?? ''} onChange={(e) => update('pronouns', e.target.value)} placeholder="they/them" />
        </Field>
        <Field label="Credentials">
          <input className="input" value={data.credentials ?? ''} onChange={(e) => update('credentials', e.target.value)} placeholder="MD, PhD" />
        </Field>
      </div>
      <Field label="Show pronouns next to name">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.showPronouns ?? true}
            onChange={(e) => update('showPronouns', e.target.checked)}
            className="h-4 w-4 accent-[#7c5cff]"
          />
          <span className="text-sm text-text-muted">Inline next to name</span>
        </label>
      </Field>
      <Field label="Job title">
        <input className="input" value={data.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} placeholder="Senior Product Designer" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company">
          <input className="input" value={data.company} onChange={(e) => update('company', e.target.value)} placeholder="Northwind Labs" />
        </Field>
        <Field label="Department">
          <input className="input" value={data.department ?? ''} onChange={(e) => update('department', e.target.value)} placeholder="Design" />
        </Field>
      </div>
    </div>
  );
}
