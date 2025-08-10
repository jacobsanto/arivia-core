
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { unifiedPropertyService } from '@/services/property/unified-property.service';

interface MobileSyncButtonProps {
  onSyncComplete: () => void;
}

export const MobileSyncButton = ({ onSyncComplete }: MobileSyncButtonProps) => {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await unifiedPropertyService.syncGuestyProperties();
      if (result.success) {
        toast.success(result.message);
        onSyncComplete();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to sync properties');
    } finally {
      setIsSyncing(false);
    }
  };

  return null;
};
