
import { SyncLog } from './syncLog.types';

// Helper to extract integration names from logs
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
  return { ...isRetrying, [logId]: value };
}
