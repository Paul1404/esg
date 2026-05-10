'use client';
import { useState } from 'react';
import type { SignatureData } from '@/lib/types';
import Field from '../Field';

type Props = { data: SignatureData; update: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void };

type Slot = 'photo' | 'logo' | 'banner';

type ImageRowProps = {
  slot: Slot;
  label: string;
  urlKey: keyof SignatureData;
  hint?: string;
  data: SignatureData;
  update: Props['update'];
  busy: Slot | null;
  onUpload: (slot: Slot, file: File) => void;
};

function ImageRow({ slot, label, urlKey, hint, data, update, busy, onUpload }: ImageRowProps) {
  const url = (data[urlKey] as string) ?? '';
  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex items-center gap-2">
          <label className="btn-soft text-xs cursor-pointer">
            {busy === slot ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(slot, f);
                e.currentTarget.value = '';
              }}
            />
          </label>
          {url ? (
            <button onClick={() => update(urlKey, '' as never)} className="btn-ghost text-xs">Remove</button>
          ) : null}
        </div>
      </div>
      <input className="input-sm" value={url} onChange={(e) => update(urlKey, e.target.value as never)} placeholder="https://… or upload above" />
      {hint ? <div className="text-xs text-text-dim">{hint}</div> : null}
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-1 rounded border border-border max-h-24 bg-bg-elev" />
      ) : null}
    </div>
  );
}

export default function ImagesSection({ data, update }: Props) {
  const [busy, setBusy] = useState<Slot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (slot: Slot, file: File) => {
    setBusy(slot);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', slot);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      // The upload route may return a non-JSON body on framework-level errors
      // (e.g. payload too large rejected before our handler runs). Parse text
      // first so we can surface a useful message instead of a JSON parse crash.
      const raw = await res.text();
      let json: { url?: string; error?: string } = {};
      if (raw) {
        try {
          json = JSON.parse(raw);
        } catch {
          json = {};
        }
      }
      if (!res.ok || !json.url) {
        const fallback =
          res.status === 413
            ? 'That file is too large — try something under 8 MB'
            : res.status === 415
              ? 'That file type isn’t supported — use PNG, JPEG, WebP, or GIF'
              : res.status === 422
                ? 'We couldn’t process that image — try a different file'
                : res.status === 429
                  ? 'You’re uploading too quickly — wait a moment and try again'
                  : res.status === 503
                    ? 'Image uploads are unavailable right now'
                    : 'Something went wrong while uploading';
        throw new Error(json.error ?? fallback);
      }
      if (slot === 'photo') update('photoUrl', json.url);
      if (slot === 'logo') update('logoUrl', json.url);
      if (slot === 'banner') update('bannerUrl', json.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(null);
    }
  };

  const rowProps = { data, update, busy, onUpload: upload };

  return (
    <div className="space-y-4">
      <h3 className="section-title">Images</h3>
      <ImageRow {...rowProps} slot="photo" label="Profile photo" urlKey="photoUrl" hint="Square, 200×200+. Will be re-encoded and stripped of EXIF." />
      <ImageRow {...rowProps} slot="logo" label="Company logo" urlKey="logoUrl" hint="Transparent PNG works best." />
      <ImageRow {...rowProps} slot="banner" label="Promo banner" urlKey="bannerUrl" hint="Wide, ~3:1 ratio. Optional click-through below." />
      <Field label="Banner click-through URL">
        <input className="input" value={data.bannerLink ?? ''} onChange={(e) => update('bannerLink', e.target.value)} placeholder="https://example.com/promo" />
      </Field>
      {error ? <div className="text-xs text-red-400">{error}</div> : null}
      <p className="text-xs text-text-dim leading-relaxed">
        Many email clients block external images by default. Always provide an{' '}
        <code className="text-text-muted">alt</code> text-equivalent in your message body for promos.
      </p>
    </div>
  );
}
