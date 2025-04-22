
import { SyncLog } from './syncLog.types';

// Helper to safely concatenate logs for pagination (helps avoid deep type recursion)
export function appendLogs(existing: SyncLog[], fetched: SyncLog[] | null): SyncLog[] {
  if (!fetched || fetched.length === 0) return existing;
  // Avoid array spread to reduce deep type instantiation
  const result: SyncLog[] = [];
  for (let i = 0; i < existing.length; i++) result.push(existing[i]);
  for (let i = 0; i < fetched.length; i++) result.push(fetched[i]);
  return result;
}

// Helper to build a unique list of integration names from logs
export function getAvailableIntegrations(rows: { service?: string | null }[]): string[] {
  return Array.from(
    new Set(rows.map((row) => (row.service || "").trim()).filter(Boolean))
  );
}

// Helper to clone and set retrying state
export function setRetryingFlag(
  isRetrying: Record<string, boolean>,
  logId: string,
  value: boolean
): Record<string, boolean> {
  const updated: Record<string, boolean> = {};
  Object.keys(isRetrying).forEach((key) => {
    updated[key] = isRetrying[key];
  });
  updated[logId] = value;
  return updated;
}
