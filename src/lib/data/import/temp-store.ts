/**
 * In-memory temporary store for import preview data.
 * Maps importId (UUID) to the validated rows + metadata.
 * Data is held only during the preview → confirm flow.
 */
import { type ValidatedRow } from "@/lib/data/import/registrants";
import { randomUUID } from "crypto";

interface ImportSession {
  importId: string;
  filename: string;
  rows: ValidatedRow[];
  validCount: number;
  errorCount: number;
  createdAt: Date;
}

// Module-level store — simple, fast, no external dependency.
// Reset on server restart, which is acceptable for this feature.
const store = new Map<string, ImportSession>();

// Auto-cleanup sessions older than 30 minutes every 5 minutes.
const SESSION_TTL_MS = 30 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Only start the cleanup interval on the first use (avoid side effects at import time).
let cleanupStarted = false;
function startCleanup(): void {
  if (cleanupStarted) return;
  cleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [id, session] of store) {
      if (now - session.createdAt.getTime() > SESSION_TTL_MS) {
        store.delete(id);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

export function createImportSession(
  filename: string,
  rows: ValidatedRow[],
): ImportSession {
  startCleanup();
  const importId = randomUUID();
  const validCount = rows.filter((r) => r.valid).length;
  const errorCount = rows.length - validCount;
  const session: ImportSession = {
    importId,
    filename,
    rows,
    validCount,
    errorCount,
    createdAt: new Date(),
  };
  store.set(importId, session);
  return session;
}

export function getImportSession(importId: string): ImportSession | undefined {
  const session = store.get(importId);
  if (!session) return undefined;
  // Check TTL on access
  if (Date.now() - session.createdAt.getTime() > SESSION_TTL_MS) {
    store.delete(importId);
    return undefined;
  }
  return session;
}

export function deleteImportSession(importId: string): void {
  store.delete(importId);
}