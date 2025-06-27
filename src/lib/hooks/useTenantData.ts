
import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { ApiClient } from '@/lib/api/client';

export function useTenantData<T>(
  table: string,
  additionalFilters?: Record<string, any>
) {
  const { tenantId } = useTenant();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const filters = { 
          tenant_id: tenantId,
          ...additionalFilters 
        };
        
        const { data: result, error } = await ApiClient.get(table, filters);
        
        if (error) {
          setError(error.message);
        } else {
          setData(result || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [table, tenantId, JSON.stringify(additionalFilters)]);

  const refresh = async () => {
    if (!tenantId) return;
    
    const filters = { 
      tenant_id: tenantId,
      ...additionalFilters 
    };
    
    const { data: result, error } = await ApiClient.get(table, filters);
    
    if (error) {
      setError(error.message);
    } else {
      setData(result || []);
      setError(null);
    }
  };

  return { data, isLoading, error, refresh };
}
