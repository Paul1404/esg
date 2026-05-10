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

// Presets tuned to read well on both white and dark email backgrounds. Text
// colors stay in the mid-dark range (around #2a-#33) so Apple Mail and
// Outlook iOS auto-invert to a comfortable mid-light, and accent colors are
// chosen for sufficient contrast on both backgrounds.
const PRESETS: { name: string; primary: string; text: string; muted: string; divider: string; tag?: string }[] = [
  { name: 'Graphite', primary: '#475569', text: '#2a3340', muted: '#6b7280', divider: '#e5e7eb', tag: 'Neutral' },
  { name: 'Iris',     primary: '#6e54e0', text: '#2a2940', muted: '#6b7280', divider: '#e5e3ec', tag: 'Vibrant' },
  { name: 'Slate Blue', primary: '#3b82f6', text: '#2a3340', muted: '#64748b', divider: '#e2e8f0', tag: 'Cool' },
  { name: 'Sage',     primary: '#16a34a', text: '#2a3328', muted: '#5a6b5e', divider: '#dbe8de', tag: 'Calm' },
  { name: 'Ocean',    primary: '#0284c7', text: '#22323d', muted: '#566c7a', divider: '#d8e6ee', tag: 'Cool' },
  { name: 'Berry',    primary: '#be185d', text: '#33222b', muted: '#7a5969', divider: '#ecd9e2', tag: 'Warm' },
  { name: 'Sunset',   primary: '#ea580c', text: '#332419', muted: '#7a6755', divider: '#ecdfd3', tag: 'Warm' },
  { name: 'Mono',     primary: '#374151', text: '#1f2937', muted: '#6b7280', divider: '#e5e7eb', tag: 'Minimal' },
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

      <Field label="Color presets" hint="All presets read well on both light and dark email backgrounds.">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              type="button"
              className="flex items-center gap-1.5 pill hover:border-border-strong"
              title={p.tag ? `${p.name} (${p.tag})` : p.name}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: p.primary }} aria-hidden="true" />
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
