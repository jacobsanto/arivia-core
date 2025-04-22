
import { useState } from "react";
import { SyncLogsFilters } from "./syncLog.types";

export function useSyncLogFilters(initial?: Partial<SyncLogsFilters>) {
  const [status, setStatus] = useState<string | null>(initial?.status ?? null);
  const [integration, setIntegration] = useState<string | null>(initial?.integration ?? null);
  const [listingId, setListingId] = useState<string>(initial?.listingId ?? "");

  return {
    status,
    setStatus,
    integration,
    setIntegration,
    listingId,
    setListingId,
  };
}
