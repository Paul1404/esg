'use client';
import { useMemo, useState } from 'react';
import type { SignatureData, SocialPlatform } from '@/lib/types';
import { BRAND_ICONS, BRAND_BY_SLUG } from '@/lib/icons';
import { socialMeta } from '@/lib/template-helpers';

type Props = {
  data: SignatureData;
  onAdd: (p: SocialPlatform) => void;
  onUpdate: (idx: number, patch: Partial<{ platform: SocialPlatform; url: string }>) => void;
  onRemove: (idx: number) => void;
};

export default function SocialsSection({ data, onAdd, onUpdate, onRemove }: Props) {
  const [picking, setPicking] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-4">
      <h3 className="section-title">Socials</h3>

      <div className="space-y-2">
        {data.socials.map((s, i) => {
          const meta = socialMeta(s.platform);
          const isOpen = picking === i;
          return (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setPicking(isOpen ? null : i); setQuery(''); }}
                className={`shrink-0 flex items-center gap-1.5 bg-bg-elev border rounded-md px-2 py-2 text-xs text-text outline-none transition ${
                  isOpen ? 'border-accent' : 'border-border hover:border-border-strong'
                }`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                title={`Icon: ${meta.label}`}
              >
                <BrandGlyph slug={s.platform} />
                <span className="truncate max-w-[80px]">{meta.label}</span>
                <span className="text-text-dim text-[10px]" aria-hidden="true">▾</span>
              </button>
              <input
                className="input-sm flex-1 min-w-0"
                value={s.url}
                onChange={(e) => onUpdate(i, { url: e.target.value })}
                placeholder={meta.baseUrl || 'https://…'}
              />
              <button
                onClick={() => { if (isOpen) setPicking(null); onRemove(i); }}
                className="btn-ghost text-xs px-2 shrink-0"
                aria-label="Remove"
                title="Remove"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {picking !== null ? (
        <IconPicker
          query={query}
          onQueryChange={setQuery}
          onPick={(slug) => {
            onUpdate(picking, { platform: slug });
            setPicking(null);
            setQuery('');
          }}
          onClose={() => { setPicking(null); setQuery(''); }}
        />
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAdd('linkedin')}
          className="pill hover:border-accent hover:text-accent transition cursor-pointer"
        >
          + Add row
        </button>
        <span className="text-xs text-text-dim">
          Pick from {BRAND_ICONS.length} bundled brand icons. Search by name in the picker.
        </span>
      </div>

      <p className="text-xs text-text-dim leading-relaxed">
        Icons render as real brand glyphs on a coloured pill. The glyphs ship inline as SVG data
        URIs, so there are no external image requests and they survive image-blocking clients.
      </p>
    </div>
  );
}

function BrandGlyph({ slug, size = 14 }: { slug: string; size?: number }) {
  const icon = BRAND_BY_SLUG[slug] ?? BRAND_BY_SLUG['website'];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={icon.path} />
    </svg>
  );
}

function IconPicker({
  query,
  onQueryChange,
  onPick,
  onClose,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onPick: (slug: string) => void;
  onClose: () => void;
}) {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BRAND_ICONS;
    return BRAND_ICONS.filter((b) =>
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      (b.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false),
    );
  }, [query]);

  return (
    <div className="rounded-md border border-border bg-bg-elev/50 p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Search ${BRAND_ICONS.length} icons (slack, tiktok, mastodon, ...)`}
          className="input-sm flex-1"
        />
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-2">Close</button>
      </div>
      {results.length === 0 ? (
        <p className="text-xs text-text-dim py-3 text-center">
          No icon matches that name. Pick the generic globe (Website) and label it manually.
        </p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-64 overflow-y-auto pr-1">
          {results.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => onPick(b.slug)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded border border-transparent hover:border-accent/40 hover:bg-accent/5 text-text-muted hover:text-text transition"
              title={b.name}
            >
              <BrandGlyph slug={b.slug} size={20} />
              <span className="text-[10px] truncate w-full text-center">{b.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
