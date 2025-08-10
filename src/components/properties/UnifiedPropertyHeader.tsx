
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

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
          Manage your Guesty properties
        </p>
      </div>
      <Button 
        onClick={onSync} 
        disabled={isLoading}
        variant="outline"
      >
        <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        Sync Properties
      </Button>
    </div>
  );
};

export default UnifiedPropertyHeader;
