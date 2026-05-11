'use client';

import { useEffect, useRef, useState } from 'react';
import type { Signature } from '@/lib/signatures';
import { MAX_SIGNATURES, MAX_SIGNATURE_NAME } from '@/lib/signatures';

type Props = {
  signatures: Signature[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export default function SignatureSwitcher({
  signatures,
  activeId,
  onSelect,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const active = signatures.find((s) => s.id === activeId) ?? signatures[0];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const startRename = (sig: Signature) => {
    setEditingId(sig.id);
    setEditValue(sig.name);
  };

  const commitRename = () => {
    if (editingId) {
      const next = editValue.trim();
      if (next) onRename(editingId, next);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (sig: Signature) => {
    if (signatures.length === 1) {
      if (!confirm(`Delete "${sig.name}"? This is your last signature — a fresh one will replace it.`)) return;
    } else if (!confirm(`Delete "${sig.name}"?`)) {
      return;
    }
    onDelete(sig.id);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 bg-bg-elev border border-border rounded-md pl-2.5 pr-2 py-1.5 text-sm text-text outline-none focus:border-accent hover:border-border-strong transition max-w-[260px]"
        title="Switch signature"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="h-5 w-5 rounded bg-accent/15 text-accent grid place-items-center text-[10px] font-semibold shrink-0">
          {signatures.length}
        </span>
        <span className="truncate">{active?.name ?? 'Signature'}</span>
        <span className="text-text-dim text-xs ml-0.5">▾</span>
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full mt-1.5 w-[320px] max-w-[calc(100vw-32px)] bg-bg-elev border border-border rounded-md shadow-soft z-40 overflow-hidden"
          role="listbox"
        >
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold">Your signatures</div>
              <div className="text-[11px] text-text-dim">Stored in this browser</div>
            </div>
            <span className="text-[11px] text-text-dim">{signatures.length} / {MAX_SIGNATURES}</span>
          </div>
          <ul className="max-h-[320px] overflow-y-auto divide-y divide-border">
            {signatures.map((s) => {
              const isActive = s.id === activeId;
              const isEditing = editingId === s.id;
              return (
                <li
                  key={s.id}
                  className={`px-3 py-2 flex items-center gap-2 ${isActive ? 'bg-accent/10' : 'hover:bg-bg-elev'}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) return;
                      onSelect(s.id);
                      setOpen(false);
                    }}
                    className="flex-1 min-w-0 text-left"
                    title={s.name}
                  >
                    {isEditing ? (
                      <input
                        className="input-sm w-full"
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') commitRename();
                          if (e.key === 'Escape') { setEditingId(null); setEditValue(''); }
                        }}
                        maxLength={MAX_SIGNATURE_NAME}
                      />
                    ) : (
                      <>
                        <div className={`text-sm truncate ${isActive ? 'text-accent font-medium' : 'text-text'}`}>
                          {s.name}
                        </div>
                        <div className="text-[11px] text-text-dim truncate">
                          {s.template} · {formatRelative(s.updatedAt)}
                        </div>
                      </>
                    )}
                  </button>
                  {!isEditing ? (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <IconBtn title="Rename" onClick={() => startRename(s)}>✎</IconBtn>
                      <IconBtn title="Duplicate" onClick={() => onDuplicate(s.id)}>⎘</IconBtn>
                      <IconBtn title="Delete" danger onClick={() => handleDelete(s)}>✕</IconBtn>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={() => {
                onCreate();
                setOpen(false);
              }}
              disabled={signatures.length >= MAX_SIGNATURES}
              className="w-full text-sm font-medium px-3 py-2 rounded-md bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              + New signature
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`px-1.5 py-1 text-xs rounded transition ${
        danger ? 'text-text-dim hover:text-red-400' : 'text-text-dim hover:text-text'
      }`}
    >
      {children}
    </button>
  );
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
