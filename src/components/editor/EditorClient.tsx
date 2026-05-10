'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { DEFAULT_SIGNATURE, TEMPLATE_LIST, type SignatureData, type SocialPlatform, type TemplateId } from '@/lib/types';
import IdentitySection from './sections/IdentitySection';
import ContactSection from './sections/ContactSection';
import ImagesSection from './sections/ImagesSection';
import SocialsSection from './sections/SocialsSection';
import StyleSection from './sections/StyleSection';
import ExtrasSection from './sections/ExtrasSection';
import PreviewPane from '../preview/PreviewPane';
import ExportPane from '../preview/ExportPane';

const STORAGE_KEY = 'esg.draft.v1';

type Tab = 'identity' | 'contact' | 'images' | 'socials' | 'style' | 'extras';

const TABS: { id: Tab; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'contact', label: 'Contact' },
  { id: 'images', label: 'Images' },
  { id: 'socials', label: 'Socials' },
  { id: 'style', label: 'Style' },
  { id: 'extras', label: 'Extras' },
];

export default function EditorClient() {
  const router = useRouter();
  const search = useSearchParams();
  const initialTemplate = (search.get('template') as TemplateId) || 'modern';
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [data, setData] = useState<SignatureData>(DEFAULT_SIGNATURE);
  const [tab, setTab] = useState<Tab>('identity');
  const [hydrated, setHydrated] = useState(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.data) setData({ ...DEFAULT_SIGNATURE, ...parsed.data });
        if (parsed.template) setTemplate(parsed.template);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ template, data }));
    } catch { /* ignore quota */ }
  }, [template, data, hydrated]);

  const update = <K extends keyof SignatureData>(key: K, value: SignatureData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const updateSocial = (idx: number, patch: Partial<{ platform: SocialPlatform; url: string }>) => {
    setData((prev) => ({
      ...prev,
      socials: prev.socials.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  };

  const addSocial = (platform: SocialPlatform) => {
    setData((prev) => ({ ...prev, socials: [...prev.socials, { platform, url: '' }] }));
  };

  const removeSocial = (idx: number) => {
    setData((prev) => ({ ...prev, socials: prev.socials.filter((_, i) => i !== idx) }));
  };

  const reset = () => {
    if (!confirm('Reset all fields to defaults? Your draft will be cleared.')) return;
    skipNextSave.current = true;
    localStorage.removeItem(STORAGE_KEY);
    setData(DEFAULT_SIGNATURE);
    setTemplate('modern');
  };

  const formProps = useMemo(() => ({ data, update }), [data]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-bg-elev/50 backdrop-blur sticky top-0 z-30">
        <div className="px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-accent text-white grid place-items-center font-bold text-sm">e</div>
              <span className="font-semibold tracking-tight">ESG</span>
            </Link>
            <span className="text-text-dim">/</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateId)}
              className="bg-bg-elev border border-border rounded-md px-2.5 py-1.5 text-sm text-text outline-none focus:border-accent"
              aria-label="Template"
            >
              {TEMPLATE_LIST.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="btn-ghost text-xs">Reset</button>
            <Link href="/" className="btn-ghost text-xs">Home</Link>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] min-h-0">
        <aside className="border-r border-border overflow-y-auto bg-bg-elev/30">
          <nav className="flex border-b border-border sticky top-0 bg-bg-elev/95 backdrop-blur z-10">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 px-3 py-3 text-xs font-medium transition relative ${
                  tab === t.id ? 'text-accent' : 'text-text-muted hover:text-text'
                }`}
              >
                {t.label}
                {tab === t.id && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent" />}
              </button>
            ))}
          </nav>
          <div className="p-5">
            {tab === 'identity' && <IdentitySection {...formProps} />}
            {tab === 'contact' && <ContactSection {...formProps} />}
            {tab === 'images' && <ImagesSection {...formProps} />}
            {tab === 'socials' && (
              <SocialsSection
                data={data}
                onAdd={addSocial}
                onUpdate={updateSocial}
                onRemove={removeSocial}
              />
            )}
            {tab === 'style' && <StyleSection {...formProps} />}
            {tab === 'extras' && <ExtrasSection {...formProps} />}
          </div>
        </aside>

        <main className="overflow-y-auto bg-bg p-5 space-y-5">
          <PreviewPane data={data} template={template} />
          <ExportPane data={data} template={template} />
        </main>
      </div>
    </div>
  );
}
