import type { SignatureData, TemplateId } from './types';

export type SavedSlot = {
  id: string;
  name: string;
  template: TemplateId;
  data: SignatureData;
  savedAt: string;
};

export const SAVES_STORAGE_KEY = 'esg.saves.v1';
export const SAVES_FILE_VERSION = 1;
export const MAX_SAVES = 20;
export const MAX_NAME_LENGTH = 60;

export type SavesFile = {
  version: number;
  exportedAt: string;
  saves: SavedSlot[];
};

export function loadSaves(): SavedSlot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedSlot);
  } catch {
    return [];
  }
}

export function writeSaves(saves: SavedSlot[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVES_STORAGE_KEY, JSON.stringify(saves));
  } catch {
    /* quota — surface to caller via try/catch outside */
    throw new Error('Your browser ran out of save space. Delete an old save to make room.');
  }
}

export function newSlotId(): string {
  // good-enough unique id without dragging in nanoid for the client
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function isSavedSlot(v: unknown): v is SavedSlot {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.template === 'string' &&
    typeof o.savedAt === 'string' &&
    o.data !== null &&
    typeof o.data === 'object'
  );
}

export function buildExportFile(saves: SavedSlot[]): SavesFile {
  return {
    version: SAVES_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    saves,
  };
}

export function parseImportFile(text: string): SavedSlot[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Unrecognized file format.');
  }
  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.saves)) {
    throw new Error('No saves found in this file.');
  }
  const valid = obj.saves.filter(isSavedSlot);
  if (valid.length === 0) {
    throw new Error('No usable saves found in this file.');
  }
  return valid;
}

export function mergeSaves(existing: SavedSlot[], incoming: SavedSlot[]): SavedSlot[] {
  const byId = new Map<string, SavedSlot>();
  for (const s of existing) byId.set(s.id, s);
  for (const s of incoming) {
    // If a save with the same id already exists, keep whichever is newer.
    const prev = byId.get(s.id);
    if (!prev || new Date(s.savedAt) > new Date(prev.savedAt)) {
      byId.set(s.id, s);
    }
  }
  return Array.from(byId.values())
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
    .slice(0, MAX_SAVES);
}
