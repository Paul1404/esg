'use client';

import { useState } from 'react';

export default function SharedActions({ html }: { html: string }) {
  const [status, setStatus] = useState<string | null>(null);

  const copyRich = async () => {
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const plain = new Blob([html.replace(/<[^>]+>/g, '')], { type: 'text/plain' });
      if ('ClipboardItem' in window) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob, 'text/plain': plain })]);
      } else {
        await navigator.clipboard.writeText(html);
      }
      setStatus('Copied as rich text');
    } catch {
      setStatus('Copy failed');
    }
    setTimeout(() => setStatus(null), 2400);
  };

  return (
    <div className="mt-4 flex items-center gap-2">
      <button onClick={copyRich} className="btn-primary text-sm">Copy as rich text</button>
      <button onClick={() => navigator.clipboard.writeText(html)} className="btn-ghost text-sm">Copy HTML</button>
      {status ? <span className="text-xs text-text-dim ml-2">{status}</span> : null}
    </div>
  );
}
