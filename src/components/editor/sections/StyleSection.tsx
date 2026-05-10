'use client';
import type { SignatureData } from '@/lib/types';
import Field from '../Field';

type Props = { data: SignatureData; update: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void };

const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'System (Helvetica/Arial)', value: "Helvetica, Arial, 'Segoe UI', Roboto, sans-serif" },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia (serif)', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Courier (mono)', value: "'Courier New', Courier, monospace" },
];

const PRESETS: { name: string; primary: string; text: string; muted: string; divider: string }[] = [
  { name: 'Iris', primary: '#7c5cff', text: '#1f2330', muted: '#6b7385', divider: '#e2e5ec' },
  { name: 'Forest', primary: '#10b981', text: '#0f1f17', muted: '#5a6b62', divider: '#dbe8e1' },
  { name: 'Sunset', primary: '#ef4444', text: '#231a1a', muted: '#7a6262', divider: '#ecdcdc' },
  { name: 'Ocean', primary: '#0ea5e9', text: '#0c1f2a', muted: '#566c7a', divider: '#d8e6ee' },
  { name: 'Slate', primary: '#475569', text: '#0f172a', muted: '#64748b', divider: '#e2e8f0' },
  { name: 'Gold', primary: '#b45309', text: '#1f1a0a', muted: '#7a6b46', divider: '#ecdcc4' },
];

export default function StyleSection({ data, update }: Props) {
  const applyPreset = (p: typeof PRESETS[number]) => {
    update('primaryColor', p.primary);
    update('textColor', p.text);
    update('mutedColor', p.muted);
    update('dividerColor', p.divider);
  };

  return (
    <div className="space-y-4">
      <h3 className="section-title">Style</h3>

      <Field label="Color presets">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => applyPreset(p)} className="flex items-center gap-1.5 pill hover:border-border-strong">
              <span className="h-3 w-3 rounded-full" style={{ background: p.primary }} />
              {p.name}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Primary / accent">
          <ColorInput value={data.primaryColor} onChange={(v) => update('primaryColor', v)} />
        </Field>
        <Field label="Text">
          <ColorInput value={data.textColor} onChange={(v) => update('textColor', v)} />
        </Field>
        <Field label="Muted">
          <ColorInput value={data.mutedColor} onChange={(v) => update('mutedColor', v)} />
        </Field>
        <Field label="Divider">
          <ColorInput value={data.dividerColor} onChange={(v) => update('dividerColor', v)} />
        </Field>
      </div>

      <Field label="Font (web-safe only)">
        <select
          className="input"
          value={data.fontFamily}
          onChange={(e) => update('fontFamily', e.target.value)}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={`Font size (${data.fontSize}px)`}>
          <input type="range" min={11} max={18} step={1} value={data.fontSize} onChange={(e) => update('fontSize', Number(e.target.value))} className="w-full accent-[#7c5cff]" />
        </Field>
        <Field label={`Width (${data.layoutWidth}px)`}>
          <input type="range" min={400} max={680} step={10} value={data.layoutWidth} onChange={(e) => update('layoutWidth', Number(e.target.value))} className="w-full accent-[#7c5cff]" />
        </Field>
      </div>
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <input
        className="input-sm flex-1 font-mono uppercase"
        value={value}
        onChange={(e) => {
          const v = e.target.value.trim();
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
        }}
      />
    </div>
  );
}
