'use client';
import type { SignatureData } from '@/lib/types';
import Field from '../Field';

type Props = { data: SignatureData; update: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void };

export default function ExtrasSection({ data, update }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="section-title">Extras</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="CTA label">
          <input className="input" value={data.ctaText ?? ''} onChange={(e) => update('ctaText', e.target.value)} placeholder="Book a meeting" />
        </Field>
        <Field label="CTA URL">
          <input className="input" value={data.ctaUrl ?? ''} onChange={(e) => update('ctaUrl', e.target.value)} placeholder="https://cal.com/you" />
        </Field>
      </div>
      <Field label="Quote / tagline" hint="Renders as italic, separated text on supported templates.">
        <input className="input" value={data.quote ?? ''} onChange={(e) => update('quote', e.target.value)} placeholder="Make it useful. Make it kind." />
      </Field>
      <Field label="Confidentiality / disclaimer" hint="Use for legal notices. Rendered small and muted.">
        <textarea
          className="input min-h-[100px] resize-y"
          value={data.disclaimer ?? ''}
          onChange={(e) => update('disclaimer', e.target.value)}
          placeholder="This email and any attachments are confidential…"
        />
      </Field>
    </div>
  );
}
