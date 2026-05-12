import { DEFAULT_SIGNATURE, type SignatureData, type TemplateId } from './types';

/**
 * A signature the user is actively maintaining. Different from a SavedSlot:
 * this is "their current copy" of a signature they edit and switch between.
 * Saves remain as point-in-time snapshots.
 */
export type Signature = {
  id: string;
  name: string;
  template: TemplateId;
  data: SignatureData;
  updatedAt: string;
};

export type SignaturesState = {
  version: number;
  signatures: Signature[];
  activeId: string;
};

export const SIGNATURES_STORAGE_KEY = 'esg.signatures.v2';
export const LEGACY_DRAFT_KEY = 'esg.draft.v1';
export const MAX_SIGNATURES = 25;
export const MAX_SIGNATURE_NAME = 60;

export function newSignatureId(): string {
  return `sig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultSignatureName(d: SignatureData, template: TemplateId): string {
  const base = (d.fullName || 'Signature').trim() || 'Signature';
  return `${base} · ${template}`.slice(0, MAX_SIGNATURE_NAME);
}

export function createSignature(
  template: TemplateId = 'modern',
  data: SignatureData = DEFAULT_SIGNATURE,
  name?: string,
): Signature {
  return {
    id: newSignatureId(),
    name: (name || defaultSignatureName(data, template)).slice(0, MAX_SIGNATURE_NAME),
    template,
    data: { ...DEFAULT_SIGNATURE, ...data },
    updatedAt: new Date().toISOString(),
  };
}

function isSignature(v: unknown): v is Signature {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.template === 'string' &&
    typeof o.updatedAt === 'string' &&
    !!o.data &&
    typeof o.data === 'object'
  );
}

/**
 * Load signatures from localStorage. If the new key is empty, fall back to
 * the legacy single-draft key so people upgrading don't lose work.
 * Always returns at least one signature.
 */
export function loadSignaturesState(): SignaturesState {
  if (typeof window === 'undefined') {
    const fresh = createSignature();
    return { version: 2, signatures: [fresh], activeId: fresh.id };
  }
  try {
    const raw = window.localStorage.getItem(SIGNATURES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.signatures)) {
        const sigs = (parsed.signatures as unknown[]).filter(isSignature).map((s) => ({
          ...s,
          data: { ...DEFAULT_SIGNATURE, ...s.data },
        }));
        if (sigs.length > 0) {
          const activeId = sigs.find((s) => s.id === parsed.activeId)?.id ?? sigs[0].id;
          return { version: 2, signatures: sigs, activeId };
        }
      }
    }
    // Migrate from legacy single-draft draft
    const legacy = window.localStorage.getItem(LEGACY_DRAFT_KEY);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        const data = { ...DEFAULT_SIGNATURE, ...(parsed?.data ?? {}) } as SignatureData;
        const template = (parsed?.template ?? 'modern') as TemplateId;
        const sig = createSignature(template, data);
        return { version: 2, signatures: [sig], activeId: sig.id };
      } catch {
        /* fall through */
      }
    }
  } catch {
    /* fall through to fresh state */
  }
  const fresh = createSignature();
  return { version: 2, signatures: [fresh], activeId: fresh.id };
}

export function writeSignaturesState(state: SignaturesState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SIGNATURES_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or disabled storage */
  }
}

export function getActive(state: SignaturesState): Signature {
  return state.signatures.find((s) => s.id === state.activeId) ?? state.signatures[0];
}

export function updateActive(
  state: SignaturesState,
  patch: Partial<Pick<Signature, 'template' | 'data' | 'name'>>,
): SignaturesState {
  return {
    ...state,
    signatures: state.signatures.map((s) =>
      s.id === state.activeId
        ? { ...s, ...patch, updatedAt: new Date().toISOString() }
        : s,
    ),
  };
}

export function addSignature(state: SignaturesState, sig: Signature): SignaturesState {
  return {
    ...state,
    signatures: [sig, ...state.signatures].slice(0, MAX_SIGNATURES),
    activeId: sig.id,
  };
}

export function duplicateSignature(state: SignaturesState, id: string): SignaturesState {
  const src = state.signatures.find((s) => s.id === id);
  if (!src) return state;
  const copy: Signature = {
    ...src,
    id: newSignatureId(),
    name: `${src.name} (copy)`.slice(0, MAX_SIGNATURE_NAME),
    updatedAt: new Date().toISOString(),
    data: { ...src.data },
  };
  return addSignature(state, copy);
}

export function renameSignature(state: SignaturesState, id: string, name: string): SignaturesState {
  const trimmed = name.trim().slice(0, MAX_SIGNATURE_NAME);
  if (!trimmed) return state;
  return {
    ...state,
    signatures: state.signatures.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
  };
}

export function deleteSignature(state: SignaturesState, id: string): SignaturesState {
  const remaining = state.signatures.filter((s) => s.id !== id);
  if (remaining.length === 0) {
    const fresh = createSignature();
    return { version: 2, signatures: [fresh], activeId: fresh.id };
  }
  const activeId = state.activeId === id ? remaining[0].id : state.activeId;
  return { ...state, signatures: remaining, activeId };
}

export function setActive(state: SignaturesState, id: string): SignaturesState {
  if (!state.signatures.some((s) => s.id === id)) return state;
  return { ...state, activeId: id };
}
