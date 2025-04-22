
import { useState, useEffect } from 'react';
import { unifiedPropertyService } from '@/services/property/unified-property.service';
import { UnifiedProperty } from '@/types/property.types';
import { toast } from 'sonner';

export const useUnifiedProperties = () => {
  const [properties, setProperties] = useState<UnifiedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await unifiedPropertyService.fetchAllProperties();
      setProperties(data);
      
      const mostRecentSync = data
        .filter(p => p.last_synced)
        .sort((a, b) => 
          new Date(b.last_synced!).getTime() - new Date(a.last_synced!).getTime()
        )[0];
        
      if (mostRecentSync?.last_synced) {
        setLastSynced(mostRecentSync.last_synced);
      }
    } catch (err: any) {
      toast.error('Failed to fetch properties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const syncWithGuesty = async () => {
    setIsLoading(true);
    const result = await unifiedPropertyService.syncGuestyProperties();
    
    if (result.success) {
      toast.success(result.message);
      await fetchProperties();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  return {
    properties,
    isLoading,
    lastSynced,
    syncWithGuesty
  };
};
