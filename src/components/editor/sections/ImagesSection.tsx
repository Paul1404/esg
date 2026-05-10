'use client';
import { useState } from 'react';
import type { SignatureData } from '@/lib/types';
import { normalizeImgSrc } from '@/lib/template-helpers';
import Field from '../Field';

type Props = { data: SignatureData; update: <K extends keyof SignatureData>(k: K, v: SignatureData[K]) => void };

type Slot = 'photo' | 'logo' | 'banner';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

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
  const [drag, setDrag] = useState(false);
  const isBusy = busy === slot;

  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        {url ? (
          <button
            onClick={() => update(urlKey, '' as never)}
            className="text-xs text-text-dim hover:text-text transition"
          >
            Remove
          </button>
        ) : null}
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onUpload(slot, f);
        }}
        className={`block cursor-pointer rounded-md border border-dashed transition px-3 py-4 text-center ${
          drag
            ? 'border-accent bg-accent-soft'
            : 'border-border hover:border-border-strong bg-bg-elev/40'
        } ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(slot, f);
            e.currentTarget.value = '';
          }}
        />
        <div className="text-xs text-text-muted">
          {isBusy ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              Uploading…
            </span>
          ) : (
            <>
              <span className="text-text font-medium">Click to upload</span>{' '}
              <span className="text-text-dim">or drag &amp; drop</span>
            </>
          )}
        </div>
        {hint ? <div className="text-[11px] text-text-dim mt-1">{hint}</div> : null}
      </label>

      <input
        className="input-sm font-mono"
        value={url}
        onChange={(e) => update(urlKey, e.target.value as never)}
        placeholder="https://… or upload above"
      />

      {url ? (
        <div className="checker rounded border border-border overflow-hidden grid place-items-center p-2 max-h-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={normalizeImgSrc(url)} alt="" className="max-h-24 object-contain" />
        </div>
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
      <ImageRow {...rowProps} slot="photo" label="Profile photo" urlKey="photoUrl" hint="Square, 200×200+. EXIF stripped." />
      <ImageRow {...rowProps} slot="logo" label="Company logo" urlKey="logoUrl" hint="Transparent PNG works best." />
      {data.logoUrl ? (
        <Field label={`Logo size (${Math.round((data.logoScale ?? 1) * 100)}%)`}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={50}
              max={400}
              step={5}
              value={Math.round((data.logoScale ?? 1) * 100)}
              onChange={(e) => update('logoScale', Number(e.target.value) / 100)}
              className="flex-1 accent-[#7c5cff]"
            />
            <button
              type="button"
              onClick={() => update('logoScale', 1)}
              className="text-xs text-text-dim hover:text-text transition"
              title="Reset to 100%"
            >
              Reset
            </button>
          </div>
        </Field>
      ) : null}
      <ImageRow {...rowProps} slot="banner" label="Promo banner" urlKey="bannerUrl" hint="Wide, ~3:1 ratio. Optional click-through below." />
      <Field label="Banner click-through URL">
        <input className="input" value={data.bannerLink ?? ''} onChange={(e) => update('bannerLink', e.target.value)} placeholder="https://example.com/promo" />
      </Field>
      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      ) : null}
      <p className="text-xs text-text-dim leading-relaxed">
        Many email clients block external images by default. Always provide an{' '}
        <code className="text-text-muted font-mono">alt</code> text-equivalent in your message body for promos.
      </p>
    </div>
  );
}
