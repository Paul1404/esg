'use client';

import { useEffect, useRef, useState } from 'react';
import type { SignatureData, TemplateId } from '@/lib/types';
import { TemplateIdSchema, SignatureSchema } from '@/lib/validation';
import {
  buildExportFile,
  loadSaves,
  MAX_NAME_LENGTH,
  MAX_SAVES,
  mergeSaves,
  newSlotId,
  parseImportFile,
  type SavedSlot,
  writeSaves,
} from '@/lib/saves';

type Props = {
  data: SignatureData;
  template: TemplateId;
  onLoad: (template: TemplateId, data: SignatureData) => void;
  notify: (msg: string) => void;
};

export default function SavesPane({ data, template, onLoad, notify }: Props) {
  const [saves, setSaves] = useState<SavedSlot[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [storageError, setStorageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-hydration init from localStorage
    setSaves(loadSaves());
    setHydrated(true);
  }, []);

  const persist = (next: SavedSlot[]) => {
    try {
      writeSaves(next);
      setSaves(next);
      setStorageError(null);
    } catch (e) {
      setStorageError(e instanceof Error ? e.message : 'Could not save to this browser.');
    }
  };

  const saveCurrent = () => {
    const name = draftName.trim() || defaultName(data, template);
    if (saves.length >= MAX_SAVES) {
      setStorageError(`You’ve hit the ${MAX_SAVES}-save limit in this browser. Delete one first.`);
      return;
    }
    const slot: SavedSlot = {
      id: newSlotId(),
      name: name.slice(0, MAX_NAME_LENGTH),
      template,
      data,
      savedAt: new Date().toISOString(),
    };
    persist([slot, ...saves]);
    setDraftName('');
    notify(`Saved "${slot.name}" to this browser`);
  };

  const overwrite = (id: string) => {
    const next = saves.map((s) =>
      s.id === id ? { ...s, template, data, savedAt: new Date().toISOString() } : s,
    );
    persist(next);
    const updated = next.find((s) => s.id === id);
    notify(updated ? `Updated "${updated.name}"` : 'Updated save');
  };

  const renameSave = (id: string, name: string) => {
    const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
    if (!trimmed) return;
    persist(saves.map((s) => (s.id === id ? { ...s, name: trimmed } : s)));
  };

  const removeSave = (id: string) => {
    const target = saves.find((s) => s.id === id);
    if (target && !confirm(`Delete save "${target.name}"?`)) return;
    persist(saves.filter((s) => s.id !== id));
  };

  const load = (slot: SavedSlot) => {
    onLoad(slot.template, slot.data);
    notify(`Loaded "${slot.name}"`);
  };

  const exportAll = () => {
    if (saves.length === 0) {
      notify('Nothing to export yet — save something first');
      return;
    }
    const payload = JSON.stringify(buildExportFile(saves), null, 2);
    downloadFile('signatures.esg.json', payload, 'application/json');
    notify(`Exported ${saves.length} save${saves.length === 1 ? '' : 's'}`);
  };

  const exportOne = (slot: SavedSlot) => {
    const payload = JSON.stringify(buildExportFile([slot]), null, 2);
    const safeName = slot.name.replace(/[^a-z0-9-_]+/gi, '-').slice(0, 40) || 'signature';
    downloadFile(`${safeName}.esg.json`, payload, 'application/json');
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const incoming = parseImportFile(text);
      const merged = mergeSaves(saves, incoming);
      persist(merged);
      notify(`Imported ${incoming.length} save${incoming.length === 1 ? '' : 's'}`);
    } catch (e) {
      setStorageError(e instanceof Error ? e.message : 'Could not import that file.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Browser saves */}
      <section className="space-y-3">
        <header className="flex items-baseline justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold">Browser saves</h4>
            <p className="text-xs text-text-dim">Stored privately in this browser. Nothing leaves your machine.</p>
          </div>
          <span className="text-xs text-text-dim shrink-0">
            {hydrated ? `${saves.length} / ${MAX_SAVES}` : '—'}
          </span>
        </header>

        <div className="flex items-center gap-2">
          <input
            className="input-sm flex-1"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder={`Name (defaults to "${defaultName(data, template)}")`}
            maxLength={MAX_NAME_LENGTH}
          />
          <button onClick={saveCurrent} className="btn-primary text-xs">Save current</button>
        </div>

        {hydrated && saves.length === 0 ? (
          <div className="text-xs text-text-dim border border-dashed border-border rounded-md px-3 py-4 text-center">
            No saves yet. Save the current signature to come back to it later.
          </div>
        ) : null}

        {saves.length > 0 ? (
          <ul className="divide-y divide-border border border-border rounded-md overflow-hidden">
            {saves.map((s) => (
              <SavedRow
                key={s.id}
                slot={s}
                onLoad={() => load(s)}
                onOverwrite={() => overwrite(s.id)}
                onRename={(n) => renameSave(s.id, n)}
                onDelete={() => removeSave(s.id)}
                onDownload={() => exportOne(s)}
              />
            ))}
          </ul>
        ) : null}

        {storageError ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {storageError}
          </div>
        ) : null}
      </section>

      {/* File export / import */}
      <section className="space-y-2">
        <header>
          <h4 className="text-sm font-semibold">Backup &amp; transfer</h4>
          <p className="text-xs text-text-dim">Move saves between browsers or devices with a JSON file.</p>
        </header>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportAll} className="btn-soft text-xs">Export all (.esg.json)</button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-soft text-xs">
            Import from file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json,.esg.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.currentTarget.value = '';
            }}
          />
        </div>
      </section>

      {/* Recovery code */}
      <RecoveryCodeBlock data={data} template={template} onLoad={onLoad} notify={notify} />
    </div>
  );
}

function SavedRow({
  slot,
  onLoad,
  onOverwrite,
  onRename,
  onDelete,
  onDownload,
}: {
  slot: SavedSlot;
  onLoad: () => void;
  onOverwrite: () => void;
  onRename: (n: string) => void;
  onDelete: () => void;
  onDownload: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(slot.name);

  const commit = () => {
    setEditing(false);
    if (name.trim() && name.trim() !== slot.name) onRename(name);
    else setName(slot.name);
  };

  return (
    <li className="px-3 py-2.5 flex items-center gap-3 bg-bg-elev/30">
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            className="input-sm w-full"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setEditing(false);
                setName(slot.name);
              }
            }}
            maxLength={MAX_NAME_LENGTH}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-text truncate text-left max-w-full hover:text-accent transition"
            title="Click to rename"
          >
            {slot.name}
          </button>
        )}
        <div className="text-[11px] text-text-dim mt-0.5">
          {slot.template} · {formatRelative(slot.savedAt)}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onLoad} className="btn-soft text-xs">Load</button>
        <button onClick={onOverwrite} className="text-xs text-text-dim hover:text-text transition px-2 py-1" title="Replace this save with the current signature">
          Update
        </button>
        <button onClick={onDownload} className="text-xs text-text-dim hover:text-text transition px-2 py-1" title="Download as .esg.json">
          ↓
        </button>
        <button onClick={onDelete} className="text-xs text-text-dim hover:text-red-400 transition px-2 py-1" title="Delete">
          ✕
        </button>
      </div>
    </li>
  );
}

function RecoveryCodeBlock({
  data,
  template,
  onLoad,
  notify,
}: {
  data: SignatureData;
  template: TemplateId;
  onLoad: (template: TemplateId, data: SignatureData) => void;
  notify: (msg: string) => void;
}) {
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recallCode, setRecallCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    setCode('');
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
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.slug) {
        setError(json.error ?? 'Could not save.');
        return;
      }
      setCode(json.slug);
      await navigator.clipboard.writeText(json.slug).catch(() => {});
      notify('Recovery code copied');
    } finally {
      setSaving(false);
    }
  };

  const recall = async () => {
    const trimmed = recallCode.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/signatures/recover/${encodeURIComponent(trimmed)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? 'Could not load that code.');
        return;
      }
      const tpl = TemplateIdSchema.safeParse(json.template);
      const parsed = SignatureSchema.safeParse(json.data);
      if (!tpl.success || !parsed.success) {
        setError('That save looks malformed.');
        return;
      }
      onLoad(tpl.data, parsed.data);
      notify(`Loaded "${json.name ?? 'signature'}" from code`);
      setRecallCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-2">
      <header>
        <h4 className="text-sm font-semibold">Recovery code (cross-device)</h4>
        <p className="text-xs text-text-dim">
          Mint a short code that loads this signature back from any browser. Treat it like a
          password — anyone with the code can view the saved data.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={save} disabled={saving} className="btn-soft text-xs">
          {saving ? 'Saving…' : 'Generate recovery code'}
        </button>
        {code ? (
          <code className="font-mono text-sm bg-bg-elev border border-border rounded px-2 py-1 select-all">
            {code}
          </code>
        ) : null}
        {code ? (
          <button
            onClick={() => {
              navigator.clipboard.writeText(code).catch(() => {});
              notify('Recovery code copied');
            }}
            className="text-xs text-text-dim hover:text-text transition"
          >
            Copy
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          className="input-sm flex-1 font-mono"
          placeholder="Have a code? Paste it to load"
          value={recallCode}
          onChange={(e) => setRecallCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') recall();
          }}
        />
        <button onClick={recall} disabled={loading || !recallCode.trim()} className="btn-ghost text-xs">
          {loading ? 'Loading…' : 'Load by code'}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      ) : null}
    </section>
  );
}

function defaultName(d: SignatureData, t: TemplateId): string {
  const base = (d.fullName || 'Signature').trim();
  return `${base} · ${t}`;
}

function formatRelative(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return iso;
  const diff = Date.now() - ts;
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return 'just now';
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function downloadFile(name: string, content: string, type: string) {
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
