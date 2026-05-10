'use client';
import type { SignatureData, SocialPlatform } from '@/lib/types';
import { SOCIAL_META } from '@/lib/template-helpers';

type Props = {
  data: SignatureData;
  onAdd: (p: SocialPlatform) => void;
  onUpdate: (idx: number, patch: Partial<{ platform: SocialPlatform; url: string }>) => void;
  onRemove: (idx: number) => void;
};

const ALL: SocialPlatform[] = [
  'linkedin', 'twitter', 'github', 'instagram', 'facebook',
  'youtube', 'website', 'medium', 'dribbble', 'behance',
];

export default function SocialsSection({ data, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="section-title">Socials</h3>
      <div className="space-y-2">
        {data.socials.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={s.platform}
              onChange={(e) => onUpdate(i, { platform: e.target.value as SocialPlatform })}
              className="bg-bg-elev border border-border rounded-md px-2 py-2 text-xs text-text outline-none focus:border-accent"
            >
              {ALL.map((p) => (
                <option key={p} value={p}>{SOCIAL_META[p].label}</option>
              ))}
            </select>
            <input
              className="input-sm flex-1"
              value={s.url}
              onChange={(e) => onUpdate(i, { url: e.target.value })}
              placeholder={SOCIAL_META[s.platform].baseUrl || 'https://…'}
            />
            <button onClick={() => onRemove(i)} className="btn-ghost text-xs px-2" aria-label="Remove">×</button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL.map((p) => (
          <button
            key={p}
            onClick={() => onAdd(p)}
            className="pill hover:border-accent hover:text-accent transition cursor-pointer"
          >
            + {SOCIAL_META[p].label}
          </button>
        ))}
      </div>
      <p className="text-xs text-text-dim leading-relaxed">
        Icons render as colored circles with letterforms — they survive image-blocking clients
        because they&apos;re not images.
      </p>
    </div>
  );
}
