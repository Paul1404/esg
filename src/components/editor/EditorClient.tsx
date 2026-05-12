'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DEFAULT_SIGNATURE, TEMPLATE_LIST, type SignatureData, type SocialPlatform, type TemplateId } from '@/lib/types';
import {
  addSignature,
  createSignature,
  defaultSignatureName,
  deleteSignature,
  duplicateSignature,
  getActive,
  loadSignaturesState,
  renameSignature,
  setActive,
  updateActive,
  writeSignaturesState,
  type SignaturesState,
} from '@/lib/signatures';
import IdentitySection from './sections/IdentitySection';
import ContactSection from './sections/ContactSection';
import ImagesSection from './sections/ImagesSection';
import SocialsSection from './sections/SocialsSection';
import StyleSection from './sections/StyleSection';
import ExtrasSection from './sections/ExtrasSection';
import SignatureSwitcher from './SignatureSwitcher';
import PreviewPane, { type LayoutPatch } from '../preview/PreviewPane';
import ExportPane from '../preview/ExportPane';

type Tab = 'identity' | 'contact' | 'images' | 'socials' | 'style' | 'extras';

const TABS: { id: Tab; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'contact', label: 'Contact' },
  { id: 'images', label: 'Images' },
  { id: 'socials', label: 'Socials' },
  { id: 'style', label: 'Style' },
  { id: 'extras', label: 'Extras' },
];

function initialState(): SignaturesState {
  // SSR / first paint must be deterministic; hydration effect will load
  // real data from localStorage.
  const seed = createSignature('modern', DEFAULT_SIGNATURE);
  return { version: 2, signatures: [seed], activeId: seed.id };
}

export default function EditorClient() {
  const search = useSearchParams();
  const initialTemplate = (search.get('template') as TemplateId) || 'modern';
  const [state, setState] = useState<SignaturesState>(initialState);
  const [tab, setTab] = useState<Tab>('identity');
  const [hydrated, setHydrated] = useState(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    const loaded = loadSignaturesState();
    // If the URL specified ?template=… and the only signature is brand-new,
    // honour that on first paint. Don't override saved templates otherwise.
    if (loaded.signatures.length === 1) {
      const only = loaded.signatures[0];
      const isPristineName = only.name.startsWith('Jamie Rivers ·');
      if (isPristineName && only.template !== initialTemplate) {
        only.template = initialTemplate;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-hydration init from localStorage
    setState(loaded);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    writeSignaturesState(state);
  }, [state, hydrated]);

  const active = getActive(state);
  const template = active.template;
  const data = active.data;

  const update = <K extends keyof SignatureData>(key: K, value: SignatureData[K]) =>
    setState((prev) => updateActive(prev, { data: { ...getActive(prev).data, [key]: value } }));

  const setTemplate = (t: TemplateId) =>
    setState((prev) => updateActive(prev, { template: t }));

  const applyLayoutPatch = (patch: LayoutPatch) =>
    setState((prev) => {
      const cur = getActive(prev).data;
      const next: SignatureData = { ...cur };
      if (typeof patch.showVerticalDivider === 'boolean') next.showVerticalDivider = patch.showVerticalDivider;
      if (typeof patch.showSectionDividers === 'boolean') next.showSectionDividers = patch.showSectionDividers;
      if (typeof patch.sectionSpacing === 'number') next.sectionSpacing = patch.sectionSpacing;
      if (typeof patch.layoutWidth === 'number') next.layoutWidth = patch.layoutWidth;
      return updateActive(prev, { data: next });
    });

  const updateSocial = (idx: number, patch: Partial<{ platform: SocialPlatform; url: string }>) => {
    setState((prev) => {
      const cur = getActive(prev).data;
      return updateActive(prev, {
        data: { ...cur, socials: cur.socials.map((s, i) => (i === idx ? { ...s, ...patch } : s)) },
      });
    });
  };

  const addSocial = (platform: SocialPlatform) => {
    setState((prev) => {
      const cur = getActive(prev).data;
      return updateActive(prev, { data: { ...cur, socials: [...cur.socials, { platform, url: '' }] } });
    });
  };

  const removeSocial = (idx: number) => {
    setState((prev) => {
      const cur = getActive(prev).data;
      return updateActive(prev, { data: { ...cur, socials: cur.socials.filter((_, i) => i !== idx) } });
    });
  };

  const resetActive = () => {
    if (!confirm('Reset this signature to defaults?')) return;
    setState((prev) =>
      updateActive(prev, {
        template: 'modern',
        data: { ...DEFAULT_SIGNATURE },
        name: defaultSignatureName(DEFAULT_SIGNATURE, 'modern'),
      }),
    );
  };

  const handleCreate = () => {
    const sig = createSignature('modern', DEFAULT_SIGNATURE);
    setState((prev) => addSignature(prev, sig));
  };

  const handleDuplicate = (id: string) => setState((prev) => duplicateSignature(prev, id));
  const handleRename = (id: string, name: string) => setState((prev) => renameSignature(prev, id, name));
  const handleDelete = (id: string) => setState((prev) => deleteSignature(prev, id));
  const handleSelect = (id: string) => setState((prev) => setActive(prev, id));

  const loadSaved = (tpl: TemplateId, next: SignatureData) => {
    // Loading a saved snapshot now replaces the active signature's contents.
    setState((prev) =>
      updateActive(prev, {
        template: tpl,
        data: { ...DEFAULT_SIGNATURE, ...next },
      }),
    );
  };

  const formProps = useMemo(() => ({ data, update }), [data]);
  const activeTemplate = TEMPLATE_LIST.find((t) => t.id === template);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-bg-elev/60 backdrop-blur sticky top-0 z-30">
        <div className="px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-accent to-accent-hover text-white grid place-items-center font-bold text-sm shadow-soft transition group-hover:scale-105">
                e
              </div>
              <span className="font-semibold tracking-tight hidden sm:inline">ESG</span>
            </Link>
            <span className="text-text-dim hidden sm:inline">/</span>
            <SignatureSwitcher
              signatures={state.signatures}
              activeId={state.activeId}
              onSelect={handleSelect}
              onCreate={handleCreate}
              onDuplicate={handleDuplicate}
              onRename={handleRename}
              onDelete={handleDelete}
            />
            <span className="text-text-dim hidden sm:inline">/</span>
            <div className="relative min-w-0">
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as TemplateId)}
                className="bg-bg-elev border border-border rounded-md pl-2.5 pr-8 py-1.5 text-sm text-text outline-none focus:border-accent hover:border-border-strong transition appearance-none cursor-pointer max-w-[220px] truncate"
                aria-label="Template"
              >
                {TEMPLATE_LIST.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-dim text-xs">▾</span>
            </div>
            {activeTemplate ? (
              <span className="text-xs text-text-dim truncate hidden md:inline">
                {activeTemplate.description}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={resetActive} className="btn-ghost text-xs">Reset</button>
            <Link href="/" className="btn-ghost text-xs">Home</Link>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] min-h-0">
        <aside className="border-r border-border overflow-y-auto bg-bg-elev/30">
          <nav
            role="tablist"
            aria-label="Editor sections"
            className="flex border-b border-border sticky top-0 bg-bg-elev/95 backdrop-blur z-10"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 px-3 py-3 text-xs font-medium transition relative ${
                  tab === t.id ? 'text-accent' : 'text-text-muted hover:text-text'
                }`}
              >
                {t.label}
                <span
                  className={`absolute bottom-0 left-3 right-3 h-0.5 bg-accent transition-opacity ${
                    tab === t.id ? 'opacity-100' : 'opacity-0'
                  }`}
                />
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
          <PreviewPane data={data} template={template} onLayoutPatch={applyLayoutPatch} />
          <ExportPane data={data} template={template} onLoad={loadSaved} />
        </main>
      </div>
    </div>
  );
}
