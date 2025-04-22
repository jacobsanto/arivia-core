
import React, { useState } from "react";
import { CardWithHeader } from "@/components/ui/card-with-header";
import { SyncLogCard } from "@/components/admin/sync-history/SyncLogCard";
import { SyncLogFilterBar } from "@/components/admin/sync-history/SyncLogFilterBar";
import { useSyncLogs } from "@/components/admin/sync-history/useSyncLogs";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 20;

const AdminSyncHistory: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [integrationFilter, setIntegrationFilter] = useState<string | null>(null);

  const {
    logs,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    availableIntegrations,
  } = useSyncLogs({
    pageSize: PAGE_SIZE,
    status: statusFilter,
    integration: integrationFilter,
  });

  // Combine logs from all pages
  const allLogs = logs.flat();

  return (
    <div className="max-w-3xl mx-auto w-full py-6 px-2 md:px-0">
      <CardWithHeader
        title="Sync History"
        description="Monitor all integration sync operations, with status, messages, and timestamps."
      >
        <SyncLogFilterBar
          status={statusFilter}
          onStatusChange={setStatusFilter}
          integration={integrationFilter}
          onIntegrationChange={setIntegrationFilter}
          availableIntegrations={availableIntegrations}
        />

        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin mr-2" /> Loading sync logs...
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm my-8 text-center">Failed to load sync logs. Please try again later.</div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          {allLogs.length === 0 && !isLoading ? (
            <div className="text-muted-foreground text-center py-10">No sync logs found.</div>
          ) : (
            allLogs.map((log) => (
              <SyncLogCard key={log.id} log={log} />
            ))
          )}
        </div>

        {hasNextPage && (
          <div className="flex justify-center mt-6">
            <button
              className="px-4 py-2 rounded bg-muted hover:bg-muted/70 border border-input text-sm"
              onClick={fetchNextPage}
              disabled={isFetchingNextPage}
              aria-label="Load more logs"
              style={{ minHeight: 44 }}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="animate-spin inline-block mr-2" size={16} /> Loading more
                </>
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}
      </CardWithHeader>
    </div>
  );
};

export default AdminSyncHistory;
