'use client';
import { COMPLIMENTARY_CLOSE_PRESETS, type SignatureData } from '@/lib/types';
import Field from '../Field';

type Props = { data: SignatureData; update: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void };

export default function ExtrasSection({ data, update }: Props) {
  const currentClose = data.complimentaryClose ?? '';
  const matchedPreset = COMPLIMENTARY_CLOSE_PRESETS.find((p) => p.value === currentClose);
  const isCustom = currentClose !== '' && !matchedPreset;

  return (
    <div className="space-y-4">
      <h3 className="section-title">Extras</h3>

      <Field label="Complimentary close" hint="Renders above the signature, e.g. before your name.">
        <div className="space-y-2">
          <select
            className="input"
            value={isCustom ? '__custom__' : currentClose}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__custom__') {
                update('complimentaryClose', currentClose || 'Best regards,');
              } else {
                update('complimentaryClose', v);
              }
            }}
          >
            {COMPLIMENTARY_CLOSE_PRESETS.map((p) => (
              <option key={p.label} value={p.value}>{p.label}</option>
            ))}
            <option value="__custom__">Custom...</option>
          </select>
          {(isCustom || currentClose) ? (
            <input
              className="input-sm"
              value={currentClose}
              onChange={(e) => update('complimentaryClose', e.target.value)}
              placeholder="Type your own, e.g. With appreciation,"
              maxLength={80}
            />
          ) : null}
        </div>
      </Field>

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
          placeholder="This email and any attachments are confidential..."
        />
      </Field>
    </div>
  );
}
