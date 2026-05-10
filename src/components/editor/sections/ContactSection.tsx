'use client';
import type { SignatureData } from '@/lib/types';
import Field from '../Field';

type Props = { data: SignatureData; update: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void };

export default function ContactSection({ data, update }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="section-title">Contact</h3>
      <Field label="Email">
        <input type="email" className="input" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="you@company.com" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone (work)">
          <input className="input" value={data.phone ?? ''} onChange={(e) => update('phone', e.target.value)} placeholder="+1 555 010 1234" />
        </Field>
        <Field label="Mobile">
          <input className="input" value={data.mobile ?? ''} onChange={(e) => update('mobile', e.target.value)} placeholder="+1 555 020 5678" />
        </Field>
      </div>
      <Field label="Website" hint="https:// is added automatically if missing">
        <input className="input" value={data.website ?? ''} onChange={(e) => update('website', e.target.value)} placeholder="company.com" />
      </Field>
      <Field label="Address">
        <input className="input" value={data.address ?? ''} onChange={(e) => update('address', e.target.value)} placeholder="500 Mission St, San Francisco, CA" />
      </Field>
    </div>
  );
}
