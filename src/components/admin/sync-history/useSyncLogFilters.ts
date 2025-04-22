
import { useState } from "react";
import { UseSyncLogsParams } from "./syncLog.types";

export function useSyncLogFilters(initial?: Partial<Omit<UseSyncLogsParams, "pageSize">>) {
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
