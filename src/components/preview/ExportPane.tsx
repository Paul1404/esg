'use client';

import { useMemo, useState } from 'react';
import { renderTemplate } from '@/templates';
import type { SignatureData, TemplateId } from '@/lib/types';
import { buildPlainText, buildVCard } from '@/lib/template-helpers';

type Tab = 'install' | 'html' | 'plaintext' | 'share';

const TABS: { id: Tab; label: string }[] = [
  { id: 'install', label: 'Install' },
  { id: 'html', label: 'HTML' },
  { id: 'plaintext', label: 'Plain text' },
  { id: 'share', label: 'Share' },
];

type Props = { data: SignatureData; template: TemplateId };

export default function ExportPane({ data, template }: Props) {
  const [tab, setTab] = useState<Tab>('install');
  const html = useMemo(() => renderTemplate(template, data), [template, data]);
  const plain = useMemo(() => buildPlainText(data), [data]);

  const copyRichText = async () => {
    const blob = new Blob([html], { type: 'text/html' });
    const plainBlob = new Blob([plain], { type: 'text/plain' });
    if (typeof window !== 'undefined' && 'ClipboardItem' in window) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob, 'text/plain': plainBlob })]);
        toast('Signature copied as rich text — paste into Gmail/Outlook compose');
        return;
      } catch { /* fall through */ }
    }
    await navigator.clipboard.writeText(html);
    toast('Copied raw HTML (clipboard rich-text not available in this browser)');
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    toast('HTML copied to clipboard');
  };

  const copyPlain = async () => {
    await navigator.clipboard.writeText(plain);
    toast('Plain text copied');
  };

  const downloadHtml = () => {
    download(`signature-${template}.html`, wrapStandalone(html), 'text/html');
  };

  const downloadVcf = () => {
    download(`${(data.fullName || 'contact').replace(/\s+/g, '_')}.vcf`, buildVCard(data), 'text/vcard');
  };

  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const share = async () => {
    setSharing(true);
    setShareUrl('');
    try {
      const res = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.fullName || 'Untitled signature',
          template,
          data,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? 'Could not save');
        return;
      }
      const url = `${window.location.origin}/s/${json.slug}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url).catch(() => {});
      toast('Share link copied');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="card">
      <div className="border-b border-border flex items-center justify-between px-4">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-3 text-xs font-medium relative transition ${
                tab === t.id ? 'text-accent' : 'text-text-muted hover:text-text'
              }`}
            >
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 py-2">
          <button onClick={copyRichText} className="btn-primary text-xs">Copy as rich text</button>
          <button onClick={copyHtml} className="btn-ghost text-xs">Copy HTML</button>
        </div>
      </div>

      <div className="p-4">
        {tab === 'install' && <InstallGuide onCopy={copyRichText} onDownload={downloadHtml} />}
        {tab === 'html' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button onClick={copyHtml} className="btn-soft text-xs">Copy</button>
              <button onClick={downloadHtml} className="btn-ghost text-xs">Download .html</button>
              <span className="text-xs text-text-dim ml-auto">{(html.length / 1024).toFixed(1)} KB · Gmail clips at 102 KB</span>
            </div>
            <pre className="text-xs bg-bg-elev border border-border rounded-md p-3 overflow-x-auto max-h-96 leading-relaxed font-mono"><code>{html}</code></pre>
          </div>
        )}
        {tab === 'plaintext' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button onClick={copyPlain} className="btn-soft text-xs">Copy</button>
              <button onClick={downloadVcf} className="btn-ghost text-xs">Download vCard (.vcf)</button>
              <span className="text-xs text-text-dim ml-auto">For Slack, terminals, plain-text-only clients</span>
            </div>
            <pre className="text-xs bg-bg-elev border border-border rounded-md p-3 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">{plain}</pre>
          </div>
        )}
        {tab === 'share' && (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">Save the current signature to a public URL anyone can copy from.</p>
            <button onClick={share} disabled={sharing} className="btn-primary text-sm">
              {sharing ? 'Saving…' : 'Create shareable link'}
            </button>
            {shareUrl && (
              <div className="flex items-center gap-2">
                <input className="input-sm flex-1 font-mono" readOnly value={shareUrl} />
                <a href={shareUrl} target="_blank" rel="noopener" className="btn-ghost text-xs">Open</a>
              </div>
            )}
            <p className="text-xs text-text-dim">Requires <code>DATABASE_URL</code> to be set on the server.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InstallGuide({ onCopy, onDownload }: { onCopy: () => void; onDownload: () => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Guide
        title="Gmail (web)"
        steps={[
          'Click "Copy as rich text" above.',
          'In Gmail, open Settings → See all settings → General.',
          'Scroll to "Signature" → Create new (or edit).',
          'Paste into the signature box (Cmd/Ctrl+V).',
          'Set "Signature defaults" to your new signature, save.',
        ]}
        cta={{ label: 'Copy as rich text', onClick: onCopy }}
      />
      <Guide
        title="Outlook (desktop, Windows)"
        steps={[
          'Download the HTML file with the button below.',
          'Open File Explorer → %APPDATA%\\Microsoft\\Signatures.',
          'Replace or create a .htm file with the same name.',
          'Copy any image assets to the matching _files folder.',
          'Restart Outlook; pick the signature in compose.',
        ]}
        cta={{ label: 'Download HTML', onClick: onDownload }}
      />
      <Guide
        title="Apple Mail (macOS)"
        steps={[
          'Open Mail → Settings → Signatures → "+" to add one.',
          'Type any placeholder, then close Settings.',
          'Click "Copy as rich text" above.',
          'Reopen Settings → Signatures, select all in the new sig, paste.',
          'Uncheck "Always match my default font".',
        ]}
        cta={{ label: 'Copy as rich text', onClick: onCopy }}
      />
      <Guide
        title="Outlook on the web / 365"
        steps={[
          'Click the gear icon → View all Outlook settings.',
          'Mail → Compose and reply → Email signature.',
          'Click into the signature box and paste rich text.',
          'Toggle "Automatically include my signature on…" as desired.',
          'Save.',
        ]}
        cta={{ label: 'Copy as rich text', onClick: onCopy }}
      />
    </div>
  );
}

function Guide({ title, steps, cta }: { title: string; steps: string[]; cta: { label: string; onClick: () => void } }) {
  return (
    <div className="bg-bg-elev border border-border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium text-sm">{title}</div>
        <button onClick={cta.onClick} className="btn-soft text-xs">{cta.label}</button>
      </div>
      <ol className="space-y-1.5 text-xs text-text-muted list-decimal list-inside leading-relaxed">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </div>
  );
}

function wrapStandalone(html: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Email signature</title></head>
<body style="margin:0;padding:24px;background:#ffffff;font-family:Helvetica,Arial,sans-serif;">
${html}
</body></html>`;
}

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;
function toast(msg: string) {
  if (typeof document === 'undefined') return;
  let el = document.getElementById('esg-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'esg-toast';
    el.style.cssText =
      'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#161a23;border:1px solid #262a35;color:#e6e8ee;padding:10px 14px;border-radius:8px;font:500 13px Inter,system-ui,sans-serif;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.4);';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (el) el.style.opacity = '0';
  }, 2400);
}
