'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { renderTemplate } from '@/templates';
import type { SignatureData, TemplateId } from '@/lib/types';

type ClientMode = 'gmail-light' | 'gmail-dark' | 'outlook' | 'apple-mail' | 'mobile';

export type LayoutPatch = {
  showVerticalDivider?: boolean;
  showSectionDividers?: boolean;
  sectionSpacing?: number;
  layoutWidth?: number;
};

const MODES: { id: ClientMode; label: string; description: string }[] = [
  { id: 'gmail-light', label: 'Gmail (Light)', description: 'Default web Gmail rendering' },
  { id: 'gmail-dark', label: 'Gmail (Dark)', description: 'Dark theme; <style> tags stripped' },
  { id: 'outlook', label: 'Outlook Desktop', description: 'Word renderer, MSO conditionals active' },
  { id: 'apple-mail', label: 'Apple Mail', description: 'Best CSS support; auto-darkens' },
  { id: 'mobile', label: 'Mobile (375px)', description: 'iOS / Gmail mobile width' },
];

type Props = {
  data: SignatureData;
  template: TemplateId;
  onLayoutPatch?: (patch: LayoutPatch) => void;
};

export default function PreviewPane({ data, template, onLayoutPatch }: Props) {
  const [mode, setMode] = useState<ClientMode>('gmail-light');
  const [tweak, setTweak] = useState(false);
  const html = useMemo(() => renderTemplate(template, data), [template, data]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const wrappedDoc = useMemo(() => buildPreviewDocument(html, mode, tweak), [html, mode, tweak]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(wrappedDoc);
    doc.close();
  }, [wrappedDoc]);

  // Wire click hotspots inside the iframe to layout patches in the parent.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    if (!tweak || !onLayoutPatch) return;

    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const hotspot = target?.closest('[data-esg-action]') as HTMLElement | null;
      if (!hotspot) return;
      e.preventDefault();
      e.stopPropagation();
      const action = hotspot.dataset.esgAction;
      if (action === 'toggle-vertical-divider') {
        onLayoutPatch({ showVerticalDivider: !(data.showVerticalDivider !== false) });
      } else if (action === 'toggle-section-dividers') {
        onLayoutPatch({ showSectionDividers: !(data.showSectionDividers !== false) });
      } else if (action === 'spacing-tighter') {
        const next = Math.max(0, (data.sectionSpacing ?? 14) - 2);
        onLayoutPatch({ sectionSpacing: next });
      } else if (action === 'spacing-looser') {
        const next = Math.min(40, (data.sectionSpacing ?? 14) + 2);
        onLayoutPatch({ sectionSpacing: next });
      }
    };
    doc.addEventListener('click', handler, true);
    return () => {
      doc.removeEventListener('click', handler, true);
    };
    // Re-attach when the iframe content has just been (re)written.
  }, [wrappedDoc, tweak, onLayoutPatch, data.showVerticalDivider, data.showSectionDividers, data.sectionSpacing]);

  const heightForMode = mode === 'mobile' ? 600 : 480;
  const showOverlayPanel = tweak && !!onLayoutPatch;

  return (
    <div className="card">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">Preview</div>
          <div className="text-xs text-text-dim">{MODES.find((m) => m.id === mode)?.description}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onLayoutPatch ? (
            <button
              type="button"
              onClick={() => setTweak((t) => !t)}
              className={`px-2.5 py-1 text-xs rounded-md border transition ${
                tweak
                  ? 'bg-accent text-white border-accent'
                  : 'bg-bg-elev text-text-muted border-border hover:text-text hover:border-border-strong'
              }`}
              title="Toggle interactive layout tweaking"
            >
              {tweak ? '✓ Tweak mode' : 'Tweak'}
            </button>
          ) : null}
          <div className="flex items-center gap-1 bg-bg-elev rounded-md border border-border p-1 flex-wrap">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-2.5 py-1 text-xs rounded transition ${
                  mode === m.id ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showOverlayPanel ? (
        <LayoutPanel data={data} onPatch={onLayoutPatch!} />
      ) : null}

      <div className={`p-5 grid place-items-center ${modeBackground(mode)}`}>
        <div
          className="bg-white rounded-md shadow-soft overflow-hidden"
          style={{
            width: mode === 'mobile' ? 375 : Math.min(720, data.layoutWidth + 80),
            transition: 'width 200ms ease',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Signature preview"
            sandbox="allow-same-origin"
            className="w-full block"
            style={{ height: heightForMode, border: 0, background: '#ffffff' }}
          />
        </div>
      </div>
      <div className="border-t border-border px-4 py-2 text-xs text-text-dim flex items-center justify-between gap-3 flex-wrap">
        <span>This is a simulation. Test with your actual email client before rolling out company-wide.</span>
        {tweak ? (
          <span className="text-accent">
            Tweak mode on. Click outlines in the preview to toggle them.
          </span>
        ) : null}
      </div>
    </div>
  );
}

function LayoutPanel({ data, onPatch }: { data: SignatureData; onPatch: (p: LayoutPatch) => void }) {
  const spacing = data.sectionSpacing ?? 14;
  const width = data.layoutWidth;
  return (
    <div className="border-b border-border bg-accent/5 px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Toggle
          on={data.showVerticalDivider !== false}
          onChange={(v) => onPatch({ showVerticalDivider: v })}
          label="Vertical divider"
        />
        <Toggle
          on={data.showSectionDividers !== false}
          onChange={(v) => onPatch({ showSectionDividers: v })}
          label="Section dividers"
        />
      </div>
      <div className="flex flex-col gap-2">
        <SliderRow
          label="Spacing"
          value={spacing}
          min={0}
          max={40}
          step={2}
          suffix="px"
          onChange={(v) => onPatch({ sectionSpacing: v })}
        />
        <SliderRow
          label="Width"
          value={width}
          min={400}
          max={680}
          step={10}
          suffix="px"
          onChange={(v) => onPatch({ layoutWidth: v })}
        />
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`px-2.5 py-1 text-xs rounded-md border transition flex items-center gap-1.5 ${
        on
          ? 'bg-accent/15 text-accent border-accent/30'
          : 'bg-bg-elev text-text-muted border-border hover:text-text'
      }`}
      aria-pressed={on}
    >
      <span className={`h-2 w-2 rounded-full ${on ? 'bg-accent' : 'bg-text-dim'}`} />
      {label}
    </button>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-xs">
      <span className="text-text-muted w-16 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[#7c5cff]"
      />
      <span className="w-12 text-right tabular-nums text-text-dim">
        {value}
        {suffix}
      </span>
    </label>
  );
}

function modeBackground(mode: ClientMode): string {
  if (mode === 'gmail-dark') return 'bg-[#202124]';
  if (mode === 'apple-mail') return 'bg-[#f5f5f7]';
  if (mode === 'outlook') return 'bg-[#faf9f8]';
  if (mode === 'mobile') return 'bg-[#1f2937]';
  return 'bg-[#f6f8fb]';
}

function buildPreviewDocument(signatureHtml: string, mode: ClientMode, tweak: boolean): string {
  const padding = mode === 'mobile' ? '12px' : '24px';
  const bodyBg = (() => {
    if (mode === 'gmail-dark') return '#202124';
    if (mode === 'apple-mail') return '#ffffff';
    if (mode === 'outlook') return '#ffffff';
    if (mode === 'mobile') return '#ffffff';
    return '#ffffff';
  })();
  const wrapperColor = mode === 'gmail-dark' ? '#e8eaed' : '#202124';
  const fakeQuote = (() => {
    if (mode === 'outlook') {
      return `<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#201f1e;">
        Hi team,<br/><br/>Quick note before EOD: sharing the v3 mocks.<br/><br/>Thanks,<br/></div>`;
    }
    if (mode === 'apple-mail') {
      return `<div style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',Helvetica,Arial,sans-serif;font-size:14px;color:#1d1d1f;">
        Hi team,<br/><br/>Quick note before EOD: sharing the v3 mocks.<br/><br/>Thanks,<br/></div>`;
    }
    if (mode === 'mobile') {
      return `<div style="font-family:-apple-system,system-ui,sans-serif;font-size:15px;color:#202124;">
        Hi team,<br/><br/>Quick note before EOD.<br/><br/>Thanks,<br/></div>`;
    }
    return `<div style="font-family:Arial,sans-serif;font-size:14px;color:${wrapperColor};">
      Hi team,<br/><br/>Quick note before EOD: sharing the v3 mocks.<br/><br/>Thanks,<br/></div>`;
  })();

  // Outlook simulation: forces tables to behave like Word.
  const outlookSim =
    mode === 'outlook'
      ? `* { margin: 0; padding: 0; }
         body { -webkit-text-size-adjust: none; }
         div, p, span { line-height: 1.4; }`
      : '';

  const gmailDarkSim =
    mode === 'gmail-dark'
      ? `body { background: #202124 !important; color: #e8eaed !important; }`
      : '';

  // Tweak-mode visualizers: outline each labelled region, add clickable
  // hotspots for layout toggles. Hover labels appear so users know what
  // they're toggling. The chips are absolute-positioned inside the region.
  const tweakCss = tweak ? TWEAK_CSS : '';
  const tweakBody = tweak ? TWEAK_BODY_HTML : '';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  html, body { margin:0; padding:0; background:${bodyBg}; }
  body { padding:${padding}; }
  ${outlookSim}
  ${gmailDarkSim}
  ${tweakCss}
</style>
</head>
<body>
${fakeQuote}
<br/>
${signatureHtml}
${tweakBody}
</body>
</html>`;
}

const TWEAK_CSS = `
[data-esg-region] {
  position: relative;
  outline: 1px dashed rgba(124, 92, 255, 0.55);
  outline-offset: 1px;
  transition: outline-color 120ms ease, background-color 120ms ease;
}
[data-esg-region]:hover {
  outline-color: rgba(124, 92, 255, 1);
  background-color: rgba(124, 92, 255, 0.06);
}
[data-esg-region]::before {
  content: attr(data-esg-region);
  position: absolute;
  top: -10px;
  left: 6px;
  font: 600 9px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #7c5cff;
  background: #ffffff;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid rgba(124, 92, 255, 0.3);
  pointer-events: none;
  z-index: 2;
}
.esg-tweak-bar {
  position: fixed;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  background: #ffffff;
  border: 1px solid rgba(124, 92, 255, 0.35);
  border-radius: 999px;
  padding: 4px;
  box-shadow: 0 6px 24px rgba(15, 18, 32, 0.18);
  z-index: 999;
  font: 600 11px/1 -apple-system,Segoe UI,Roboto,sans-serif;
}
.esg-tweak-bar button {
  appearance: none;
  background: #f4f1ff;
  color: #4b3edc;
  border: 0;
  border-radius: 999px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.esg-tweak-bar button:hover {
  background: #7c5cff;
  color: #ffffff;
}
`;

const TWEAK_BODY_HTML = `
<div class="esg-tweak-bar" role="toolbar" aria-label="Quick layout actions">
  <button type="button" data-esg-action="toggle-vertical-divider" title="Toggle vertical divider">↕ vertical rule</button>
  <button type="button" data-esg-action="toggle-section-dividers" title="Toggle section dividers">/ section rules</button>
  <button type="button" data-esg-action="spacing-tighter" title="Tighter spacing">− tighter</button>
  <button type="button" data-esg-action="spacing-looser" title="Looser spacing">+ looser</button>
</div>
`;
