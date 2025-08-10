
import { useState, useEffect } from 'react';
import { unifiedPropertyService } from '@/services/property/unified-property.service';
import { UnifiedProperty } from '@/types/property.types';
import { toast } from 'sonner';
import { SortOption } from '@/components/properties/PropertySort';

export const useUnifiedProperties = (searchQuery: string = '') => {
  const [properties, setProperties] = useState<UnifiedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOption>({
    label: "Title (A-Z)",
    value: "title-asc",
    column: "title",
    ascending: true
  });

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await unifiedPropertyService.fetchAllProperties(currentSort, searchQuery);
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
  }, [currentSort, searchQuery]);

  const syncWithGuesty = async () => {
    setIsLoading(true);
    try {
      await fetchProperties();
      toast.success('Properties refreshed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (option: SortOption) => {
    setCurrentSort(option);
  };

  return {
    properties,
    isLoading,
    lastSynced,
    syncWithGuesty,
    currentSort: currentSort.value,
    handleSort,
    fetchProperties
  };
};
