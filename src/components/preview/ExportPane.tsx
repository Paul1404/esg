'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { renderTemplate } from '@/templates';
import type { SignatureData, TemplateId } from '@/lib/types';
import { buildPlainText, buildVCard } from '@/lib/template-helpers';
import SavesPane from './SavesPane';

type Tab = 'install' | 'html' | 'plaintext' | 'saves';

const TABS: { id: Tab; label: string }[] = [
  { id: 'install', label: 'Install' },
  { id: 'html', label: 'HTML' },
  { id: 'plaintext', label: 'Plain text' },
  { id: 'saves', label: 'Saves' },
];

type Props = {
  data: SignatureData;
  template: TemplateId;
  onLoad: (template: TemplateId, data: SignatureData) => void;
};

export default function ExportPane({ data, template, onLoad }: Props) {
  const [tab, setTab] = useState<Tab>('install');
  const html = useMemo(() => renderTemplate(template, data), [template, data]);
  const plain = useMemo(() => buildPlainText(data), [data]);

  const copyRichText = async () => {
    const blob = new Blob([html], { type: 'text/html' });
    const plainBlob = new Blob([plain], { type: 'text/plain' });
    if (typeof window !== 'undefined' && 'ClipboardItem' in window) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob, 'text/plain': plainBlob })]);
        toast('Signature copied as rich text. Paste into Gmail or Outlook compose.');
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
        {tab === 'install' && (
          <InstallGuide
            onCopy={copyRichText}
            onCopyHtml={copyHtml}
            onCopyPlain={copyPlain}
            onDownload={downloadHtml}
          />
        )}
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
        {tab === 'saves' && (
          <SavesPane data={data} template={template} onLoad={onLoad} notify={toast} />
        )}
      </div>
    </div>
  );
}

type GuideGroup = 'web' | 'desktop' | 'mobile';

type GuideEntry = {
  title: string;
  group: GuideGroup;
  /** Steps shown to the user. Strings only — keep them short. */
  steps: string[];
  /** Optional callout shown under the steps (gotchas, caveats). */
  note?: string;
  /** Which copy/download action to feature as the primary CTA. */
  ctaKind: 'rich' | 'html' | 'plain' | 'download';
};

const GUIDES: GuideEntry[] = [
  // ---------- Web ----------
  {
    title: 'Gmail (web)',
    group: 'web',
    ctaKind: 'rich',
    steps: [
      'Click "Copy as rich text" above.',
      'In Gmail, click the gear icon → See all settings.',
      'On the General tab, scroll to the "Signature" section.',
      'Click + Create new, name it, then click Create.',
      'Click into the editor box and paste (Cmd/Ctrl+V).',
      'Under "Signature defaults", set it for new mail and replies/forwards.',
      'Scroll to the bottom and click Save Changes.',
    ],
    note: 'Always Create new — pasting over an existing signature can leave behind invisible styles that break your new one.',
  },
  {
    title: 'Outlook on the web (Outlook.com / 365)',
    group: 'web',
    ctaKind: 'rich',
    steps: [
      'At outlook.com / outlook.office.com, click the Settings gear (top-right).',
      'Open the Accounts tab in the left sidebar.',
      'Click Signatures in the middle column.',
      'Click + New signature, give it a name.',
      'Click into the editor box and paste (Cmd/Ctrl+V), then click Save.',
      'Optionally set defaults for New messages and Replies/forwards, then Save again.',
    ],
  },
  {
    title: 'Yahoo Mail',
    group: 'web',
    ctaKind: 'rich',
    steps: [
      'Open Yahoo Mail → click the Settings gear (top-right).',
      'Click More Settings at the bottom of the Quick Settings menu.',
      'In the left menu, click Writing email.',
      'Under Signature, toggle the switch next to your email address ON.',
      'Click into the editor that appears and paste your signature.',
      'Yahoo auto-saves; no Save button needed.',
    ],
  },

  // ---------- Desktop ----------
  {
    title: 'New Outlook (Windows / Mac)',
    group: 'desktop',
    ctaKind: 'rich',
    steps: [
      'Open New Outlook → click the Settings gear (top-right).',
      'Click Accounts → Signatures in the left sub-menu.',
      'Click + New signature, give it a name.',
      'Paste (Cmd/Ctrl+V) into the editor box, then click Save.',
      'Optionally set it as default for New messages and Replies/forwards, then Save again.',
    ],
    note: 'New Outlook is the rebuilt app that resembles Outlook on the web — different from "Classic" Outlook.',
  },
  {
    title: 'Classic Outlook (Windows / Mac)',
    group: 'desktop',
    ctaKind: 'rich',
    steps: [
      'Open Outlook → click New Email to open a blank compose window.',
      'In the compose window, click Insert → Signature → Signatures…',
      'Click New, give the signature a name, click OK.',
      'Click into the Edit signature box and paste (Cmd/Ctrl+V).',
      'Optionally pick this signature as the default for your account.',
      'Click OK.',
    ],
    note: 'Outlook embeds images on send. Pictures may compress, and recipients on other clients may need to "Download pictures" to see them.',
  },
  {
    title: 'Apple Mail (macOS)',
    group: 'desktop',
    ctaKind: 'rich',
    steps: [
      'Open Mail → Settings → Signatures.',
      'In the left column, pick the email account.',
      'Click + below the middle column, then name the signature.',
      'Uncheck "Always match my default message font" — without this, formatting is stripped on paste.',
      'Click into the right preview pane and paste (Cmd+V).',
      'Images may look broken in the preview — this is an Apple Mail bug. They render correctly in real messages.',
    ],
    note: 'For pixel-perfect HTML, edit ~/Library/Mail/V10/MailData/Signatures/<name>.mailsignature and Lock the file in Finder → Get Info.',
  },
  {
    title: 'Thunderbird',
    group: 'desktop',
    ctaKind: 'html',
    steps: [
      'Click the ☰ menu → Account Settings.',
      'In the left sidebar, click your account name (your email address).',
      'Under Default Identity, check the "Use HTML" box.',
      'Click "Copy HTML" above and paste into the Signature Text box.',
      'No Save button — Thunderbird stores it automatically.',
    ],
    note: 'Compose may show red borders around tables in your signature. Those are editor hints — they do not appear to recipients.',
  },

  // ---------- Mobile ----------
  {
    title: 'Gmail app (iOS)',
    group: 'mobile',
    ctaKind: 'rich',
    steps: [
      'On your computer: set up your signature in Gmail web first (see above) and mark it default.',
      'On iPhone: open the Gmail app → ☰ menu → Settings.',
      'Tap your account → Signature Settings.',
      'Turn OFF Mobile Signature.',
      'Send a test email — iOS Gmail will auto-apply your web signature on send (it is NOT shown in compose).',
    ],
    note: 'Gmail iOS only supports plain-text mobile signatures locally, but it auto-pulls your web signature on send when Mobile Signature is off.',
  },
  {
    title: 'Gmail app (Android)',
    group: 'mobile',
    ctaKind: 'plain',
    steps: [
      'Gmail for Android does NOT auto-pull your web signature — set it per device.',
      'Open the Gmail app → ☰ menu → Settings → your account.',
      'Tap Mobile Signature.',
      'Paste plain text only (HTML/images do not render reliably).',
      'Tap OK.',
    ],
    note: 'Android Gmail support for HTML signatures is poor; images and complex layouts often break. Plain text is the safe default.',
  },
  {
    title: 'iPhone Mail (default app)',
    group: 'mobile',
    ctaKind: 'rich',
    steps: [
      'On your computer: email yourself the signature (do NOT copy from Safari mobile — formatting gets stripped).',
      'On iPhone: open Mail → open the email → press-and-hold to select the entire signature → Copy.',
      'Open Settings → Mail → Signature (near the bottom).',
      'Pick All Accounts or Per Account, then clear the existing signature.',
      'Press-and-hold the empty field → Paste.',
      'Formatting will be removed — then shake your phone and tap Undo to restore the HTML formatting.',
    ],
    note: 'If "shake to undo" does nothing, enable it: Settings → Accessibility → Touch → Shake to Undo.',
  },
  {
    title: 'iPad Mail (default app)',
    group: 'mobile',
    ctaKind: 'rich',
    steps: [
      'On your computer: email yourself the signature (do NOT copy from Safari on iPad).',
      'On iPad: open Mail → open the email → press-and-hold → Copy the whole signature.',
      'Open Settings → Mail → Signature.',
      'Pick All Accounts or Per Account, clear the field.',
      'Press-and-hold → Paste.',
      'Gently shake the iPad to bring up Undo, then tap Undo to restore formatting.',
    ],
    note: 'Same shake-to-undo trick as iPhone. Re-enable it under Settings → Accessibility → Touch if it does not appear.',
  },
  {
    title: 'Outlook Mobile (iOS)',
    group: 'mobile',
    ctaKind: 'rich',
    steps: [
      'On your computer: email yourself the signature so you can copy it inside Outlook Mobile.',
      'Open Outlook Mobile → open the email → press-and-hold to select the whole signature → Copy.',
      'Back in Inbox → tap your profile circle (top-left).',
      'Tap the Settings gear (bottom-left).',
      'Scroll to Signature in the Mail section.',
      'Select-all the existing text and delete it, then press-and-hold to Paste.',
      'Tap the checkmark (top-right) to save. The bordered boxes you see are only in the editor.',
    ],
  },
  {
    title: 'Outlook Mobile (Android)',
    group: 'mobile',
    ctaKind: 'plain',
    steps: [
      'Open Outlook Mobile → profile circle → Settings gear.',
      'Scroll to Signature in the Mail section.',
      'Clear the existing signature.',
      'Paste plain text — HTML support is unreliable on Android.',
      'Tap the back arrow / save indicator to confirm.',
    ],
    note: 'Outlook Android currently only renders plain-text signatures consistently. For HTML on Android, set it server-side in Outlook on the web.',
  },
];

const GROUP_LABELS: Record<GuideGroup | 'all', string> = {
  all: 'All clients',
  web: 'Web',
  desktop: 'Desktop',
  mobile: 'Mobile',
};

function InstallGuide({
  onCopy,
  onCopyHtml,
  onCopyPlain,
  onDownload,
}: {
  onCopy: () => void;
  onCopyHtml: () => void;
  onCopyPlain: () => void;
  onDownload: () => void;
}) {
  const [filter, setFilter] = useState<GuideGroup | 'all'>('all');
  const [tipsOpen, setTipsOpen] = useState(false);

  const ctaFor = (kind: GuideEntry['ctaKind']): { label: string; onClick: () => void } => {
    switch (kind) {
      case 'rich':
        return { label: 'Copy rich text', onClick: onCopy };
      case 'html':
        return { label: 'Copy HTML', onClick: onCopyHtml };
      case 'plain':
        return { label: 'Copy plain text', onClick: onCopyPlain };
      case 'download':
        return { label: 'Download .html', onClick: onDownload };
    }
  };

  const visibleGroups: GuideGroup[] =
    filter === 'all' ? ['web', 'desktop', 'mobile'] : [filter];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {(['all', 'web', 'desktop', 'mobile'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-2.5 py-1 text-xs rounded-full border transition ${
              filter === id
                ? 'bg-accent text-white border-accent'
                : 'bg-bg-elev text-text-muted border-border hover:text-text hover:border-border-strong'
            }`}
          >
            {GROUP_LABELS[id]}
          </button>
        ))}
        <span className="text-[11px] text-text-dim ml-1">
          Tip: clipboard format matters — pick the right "Copy" action per client.
        </span>
      </div>

      {visibleGroups.map((g) => {
        const items = GUIDES.filter((x) => x.group === g);
        if (items.length === 0) return null;
        return (
          <section key={g} className="space-y-2.5">
            <header className="flex items-baseline justify-between">
              <h4 className="text-sm font-semibold">{GROUP_LABELS[g]}</h4>
              <span className="text-[11px] text-text-dim">{items.length} guide{items.length === 1 ? '' : 's'}</span>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((entry) => (
                <Guide
                  key={entry.title}
                  title={entry.title}
                  steps={entry.steps}
                  note={entry.note}
                  cta={ctaFor(entry.ctaKind)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <TipsAndGotchas open={tipsOpen} onToggle={() => setTipsOpen((o) => !o)} />
    </div>
  );
}

function Guide({
  title,
  steps,
  note,
  cta,
}: {
  title: string;
  steps: string[];
  note?: string;
  cta: { label: string; onClick: () => void };
}) {
  return (
    <div className="bg-bg-elev border border-border rounded-md p-4 flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="font-medium text-sm truncate" title={title}>{title}</div>
        <button onClick={cta.onClick} className="btn-soft text-xs shrink-0">{cta.label}</button>
      </div>
      <ol className="space-y-1.5 text-xs text-text-muted list-decimal list-inside leading-relaxed">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      {note ? (
        <p className="mt-3 text-[11px] text-text-dim border-t border-border pt-2 leading-relaxed">
          <span className="text-accent font-semibold">Note: </span>{note}
        </p>
      ) : null}
    </div>
  );
}

function TipsAndGotchas({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <section className="border border-border rounded-md bg-bg-elev/40">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div>
          <div className="text-sm font-semibold">Tips &amp; gotchas</div>
          <div className="text-xs text-text-dim">
            Dark mode behavior, Outlook image quirks, reply/forward image loss.
          </div>
        </div>
        <span className="text-text-dim text-sm shrink-0">{open ? '▴' : '▾'}</span>
      </button>
      {open ? (
        <div className="px-4 pb-4 space-y-4 text-xs text-text-muted leading-relaxed">
          <Tip
            title="Dark mode"
            body={
              <>
                <p>
                  Email clients translate signatures into dark mode differently. Some leave the white
                  background alone, others invert every color, and a few invert only when contrast
                  drops below a threshold. <span className="text-text">Behavior is mostly out of the
                  sender's control.</span>
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use a transparent-background PNG logo (not a GIF), with colors visible on both light and dark backgrounds.</li>
                  <li>Add a subtle white stroke / glow around dark logo elements in Photoshop / Illustrator so they stay readable when inverted.</li>
                  <li>Avoid relying on background colors — different clients ignore, invert, or override them.</li>
                  <li>Brand colors near pure black or pure white are most likely to flip. Mid-tone accents survive better.</li>
                  <li>Test on a real device: toggle iOS / Android / Outlook dark mode and view a sent message.</li>
                  <li>CSS <code className="font-mono text-[10px] bg-bg-elev px-1 rounded">@media (prefers-color-scheme: dark)</code> generally does NOT survive paste into signature editors — they strip <code className="font-mono text-[10px] bg-bg-elev px-1 rounded">&lt;style&gt;</code> tags.</li>
                </ul>
              </>
            }
          />
          <Tip
            title="Outlook embeds images (and may compress them)"
            body={
              <>
                <p>
                  Desktop Outlook (Windows + Mac) embeds inline images as CID attachments rather than
                  hot-linking them. That solves some loading problems but creates new ones:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Recipients on non-Outlook clients may see a "Download pictures" warning until they trust your address.</li>
                  <li>Outlook can compress embedded images, softening fine lines and small text in logos.</li>
                  <li>To disable compression: File → Options → Mail → Editor Options → Advanced → uncheck "Do not compress images in file" (Microsoft 365 v2007+).</li>
                  <li>Outlook on the web and Outlook Mobile behave differently — they generally hot-link rather than embed.</li>
                </ul>
              </>
            }
          />
          <Tip
            title="Reply / forward round-trips lose embedded images"
            body={
              <>
                <p>
                  When an email signature with embedded images is replied to or forwarded by another
                  client (especially iPhone Mail), the inline attachments often get stripped — the
                  recipient sees the layout with the images missing.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>For brand-critical artwork (banners, ads), host the image on a public URL and link to it instead of pasting it inline.</li>
                  <li>Keep a plain-text fallback (use the Plain text tab) for replies on minimal clients.</li>
                  <li>Test by sending Outlook → iPhone → reply back to Outlook and inspecting the result.</li>
                </ul>
              </>
            }
          />
        </div>
      ) : null}
    </section>
  );
}

function Tip({ title, body }: { title: string; body: ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold text-text mb-1">{title}</div>
      <div className="space-y-1">{body}</div>
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
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText =
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#161a23;border:1px solid #363b48;color:#e6e8ee;padding:10px 16px;border-radius:10px;font:500 13px var(--font-sans),Inter,system-ui,sans-serif;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,0.5),0 0 0 1px rgba(124,92,255,0.15);transition:opacity 200ms ease;pointer-events:none;';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  el.style.animation = 'esg-toast-in 180ms ease-out';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (el) el.style.opacity = '0';
  }, 2400);
}
