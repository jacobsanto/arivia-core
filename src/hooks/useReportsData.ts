// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  frequency?: string;
  status: string;
  last_run?: string;
}

export const useReportsData = () => {
  const [reports, setReports] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setReports(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
      setError(errorMessage);
      console.error('Error fetching reports:', err);
      
      toast({
        title: "Error Loading Reports",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Provide fallback data
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const refetch = () => {
    fetchReports();
  };

  return {
    reports,
    loading,
    error,
    refetch,
  };
};