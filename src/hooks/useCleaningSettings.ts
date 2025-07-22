import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CleaningConfig {
  id: string;
  listing_id: string;
  config_name: string;
  is_active: boolean;
}

export const useCleaningSettings = () => {
  const [configs, setConfigs] = useState<CleaningConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('property_cleaning_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setConfigs(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cleaning configurations';
      setError(errorMessage);
      console.error('Error fetching cleaning configs:', err);
      
      toast({
        title: "Error Loading Configurations",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Provide fallback data
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const refetch = () => {
    fetchConfigs();
  };

  return {
    configs,
    loading,
    error,
    refetch,
  };
};