
import React, { useState } from "react";
import { CardWithHeader } from "@/components/ui/card-with-header";
import { SyncLogCard } from "@/components/admin/sync-history/SyncLogCard";
import { SyncLogFilterBar } from "@/components/admin/sync-history/SyncLogFilterBar";
import { useSyncLogs, SyncLog } from "@/components/admin/sync-history/useSyncLogs";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

const PAGE_SIZE = 20;

const AdminSyncHistory: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [integrationFilter, setIntegrationFilter] = useState<string | null>(null);
  const [listingIdFilter, setListingIdFilter] = useState<string>("");

  const {
    logs,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    availableIntegrations,
    retrySync,
    isRetrying,
  } = useSyncLogs({
    pageSize: PAGE_SIZE,
    status: statusFilter,
    integration: integrationFilter,
    listingId: listingIdFilter ? listingIdFilter : null,
  });

  const handleRetrySync = (log: SyncLog) => {
    retrySync({
      logId: log.id,
      service: log.service,
      syncType: log.sync_type || undefined
    });
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto w-full py-6 px-2 md:px-4">
        <CardWithHeader
          title="Sync History"
          description="Monitor all integration sync operations, with status, messages, and timestamps."
          rightHeaderContent={
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1"
              onClick={() => {
                window.location.reload();
              }}
            >
              <RefreshCw size={14} /> Refresh
            </Button>
          }
        >
          <div className="px-1">
            <SyncLogFilterBar
              status={statusFilter}
              onStatusChange={setStatusFilter}
              integration={integrationFilter}
              onIntegrationChange={setIntegrationFilter}
              availableIntegrations={availableIntegrations}
              listingId={listingIdFilter}
              onListingIdChange={setListingIdFilter}
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin mr-2" /> Loading sync logs...
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm my-8 text-center">Failed to load sync logs. Please try again later.</div>
          )}

          <div className="flex flex-col gap-3 mt-4">
            {logs.length === 0 && !isLoading ? (
              <div className="text-muted-foreground text-center py-10">No sync logs found.</div>
            ) : (
              logs.map((log) => (
                <SyncLogCard 
                  key={log.id} 
                  log={log} 
                  onRetrySync={handleRetrySync} 
                  isRetrying={isRetrying[log.id]} 
                />
              ))
            )}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-6">
              <button
                className="px-4 py-2 rounded bg-muted hover:bg-muted/70 border border-input text-sm"
                onClick={() => fetchNextPage()}
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
    </TooltipProvider>
  );
};

export default AdminSyncHistory;
