
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { format } from "date-fns";

interface UnifiedPropertyHeaderProps {
  onSync: () => void;
  isLoading: boolean;
  lastSynced: string | null;
}

const UnifiedPropertyHeader = ({ onSync, isLoading, lastSynced }: UnifiedPropertyHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <p className="text-muted-foreground">
          Manage your portfolio of luxury villas synced from Guesty.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        {lastSynced && (
          <div className="text-sm text-muted-foreground">
            Last synced: {format(new Date(lastSynced), 'PPpp')}
          </div>
        )}
        <Button onClick={onSync} disabled={isLoading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Syncing...' : 'Sync with Guesty'}
        </Button>
      </div>
    </div>
  );
};

export default UnifiedPropertyHeader;
