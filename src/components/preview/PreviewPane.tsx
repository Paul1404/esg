'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { renderTemplate } from '@/templates';
import type { SignatureData, TemplateId } from '@/lib/types';

type ClientMode = 'gmail-light' | 'gmail-dark' | 'outlook' | 'apple-mail' | 'mobile';

const MODES: { id: ClientMode; label: string; description: string }[] = [
  { id: 'gmail-light', label: 'Gmail (Light)', description: 'Default web Gmail rendering' },
  { id: 'gmail-dark', label: 'Gmail (Dark)', description: 'Dark theme; <style> tags stripped' },
  { id: 'outlook', label: 'Outlook Desktop', description: 'Word renderer, MSO conditionals active' },
  { id: 'apple-mail', label: 'Apple Mail', description: 'Best CSS support; auto-darkens' },
  { id: 'mobile', label: 'Mobile (375px)', description: 'iOS / Gmail mobile width' },
];

type Props = { data: SignatureData; template: TemplateId };

export default function PreviewPane({ data, template }: Props) {
  const [mode, setMode] = useState<ClientMode>('gmail-light');
  const html = useMemo(() => renderTemplate(template, data), [template, data]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const wrappedDoc = useMemo(() => buildPreviewDocument(html, mode), [html, mode]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(wrappedDoc);
    doc.close();
  }, [wrappedDoc]);

  const heightForMode = mode === 'mobile' ? 600 : 460;

  return (
    <div className="card">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">Preview</div>
          <div className="text-xs text-text-dim">{MODES.find((m) => m.id === mode)?.description}</div>
        </div>
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
      <div className="border-t border-border px-4 py-2 text-xs text-text-dim">
        This is a simulation. Test with your actual email client before rolling out company-wide.
      </div>
    </div>
  );
}

function modeBackground(mode: ClientMode): string {
  if (mode === 'gmail-dark') return 'bg-[#202124]';
  if (mode === 'apple-mail') return 'bg-[#f5f5f7]';
  if (mode === 'outlook') return 'bg-[#faf9f8]';
  if (mode === 'mobile') return 'bg-[#1f2937]';
  return 'bg-[#f6f8fb]';
}

function buildPreviewDocument(signatureHtml: string, mode: ClientMode): string {
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

  // Outlook simulation: forces tables to behave like Word. Clip at 600px,
  // reset margins, ignore many CSS features. This is approximate; the only
  // ground-truth is sending a real test email.
  const outlookSim =
    mode === 'outlook'
      ? `* { margin: 0; padding: 0; }
         body { -webkit-text-size-adjust: none; }
         div, p, span { line-height: 1.4; }`
      : '';

  // Gmail dark mode: most clients invert greyscale only when content has
  // light backgrounds. Reproduce that approximation visually.
  const gmailDarkSim =
    mode === 'gmail-dark'
      ? `body { background: #202124 !important; color: #e8eaed !important; }
         /* Gmail keeps signature tables as-is, with their own colors */`
      : '';

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
</style>
</head>
<body>
${fakeQuote}
<br/>
${signatureHtml}
</body>
</html>`;
}
