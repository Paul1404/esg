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
            <p className="text-sm text-text-muted">Save the current signature to a link your colleagues can open and copy from — no account needed.</p>
            <button onClick={share} disabled={sharing} className="btn-primary text-sm">
              {sharing ? 'Saving…' : 'Create shareable link'}
            </button>
            {shareUrl && (
              <div className="flex items-center gap-2">
                <input className="input-sm flex-1 font-mono" readOnly value={shareUrl} />
                <a href={shareUrl} target="_blank" rel="noopener" className="btn-ghost text-xs">Open</a>
              </div>
            )}
            <p className="text-xs text-text-dim leading-relaxed">
              Anyone with the link can view this signature, including the email, phone, and any other
              details you’ve filled in. Don’t share publicly if it contains private contact info.
            </p>
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
          'In Gmail, click the gear icon → See all settings.',
          'On the General tab, scroll to "Signature" and click + Create new.',
          'Name the signature, then paste into the editor box (Cmd/Ctrl+V).',
          'Under "Signature defaults", set it for new mail and replies/forwards.',
          'Scroll to the bottom and click Save Changes.',
        ]}
        cta={{ label: 'Copy as rich text', onClick: onCopy }}
      />
      <Guide
        title="New Outlook (Windows / Mac)"
        steps={[
          'Click "Copy as rich text" above.',
          'Open Outlook → Settings (gear) → Accounts → Signatures.',
          'If you have multiple accounts, pick the one to apply it to.',
          'Click + New signature, name it, then paste into the editor.',
          'Use the checkboxes to apply to new messages and/or replies.',
          'Click Save.',
        ]}
        cta={{ label: 'Copy as rich text', onClick: onCopy }}
      />
      <Guide
        title="Classic Outlook (Windows)"
        steps={[
          'Download the HTML file with the button below.',
          'Open File Explorer and paste %APPDATA%\\Microsoft\\Signatures into the address bar.',
          'Save the downloaded file as <Name>.htm in that folder.',
          'If your signature has images, put them in a matching <Name>_files folder.',
          'Restart Outlook → File → Options → Mail → Signatures, pick it as the default.',
        ]}
        cta={{ label: 'Download HTML', onClick: onDownload }}
      />
      <Guide
        title="Apple Mail (macOS)"
        steps={[
          'In Mail → Settings → Signatures, click + to add a placeholder signature.',
          'Uncheck "Always match my default message font", then quit Mail.',
          'Click "Copy as rich text" above.',
          'Reopen Mail → Settings → Signatures, click into the new signature, select all, and paste.',
          'For pixel-perfect HTML, edit the .mailsignature file under ~/Library/Mail/V10/MailData/Signatures (replace the <body>…</body>) and lock the file in Finder → Get Info.',
        ]}
        cta={{ label: 'Copy as rich text', onClick: onCopy }}
      />
      <Guide
        title="Outlook on the web / Microsoft 365"
        steps={[
          'At outlook.office.com, click the gear icon → View all Outlook settings.',
          'Go to Mail → Compose and reply → Email signature.',
          'Click + New signature, give it a name, and paste rich text into the editor.',
          'Use "For new messages" and "For replies/forwards" dropdowns to set defaults.',
          'Click Save.',
        ]}
        cta={{ label: 'Copy as rich text', onClick: onCopy }}
      />
      <Guide
        title="iOS / Android (mobile)"
        steps={[
          'Sync at the server: most mobile apps do not pull your desktop signature automatically.',
          'For Gmail mobile: Settings → your account → Mobile signature (plain text only).',
          'For Outlook mobile: Settings → Signature (plain text by default).',
          'For full HTML on mobile, set it server-side via Outlook on the web or a Workspace admin policy.',
          'Test by sending yourself a message from the mobile app.',
        ]}
        cta={{ label: 'Copy plain text', onClick: onCopy }}
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
