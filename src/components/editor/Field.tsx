import type { ReactNode } from 'react';

type Props = { label: string; hint?: string; children: ReactNode };

export default function Field({ label, hint, children }: Props) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-xs text-text-dim">{hint}</p> : null}
    </div>
  );
}
