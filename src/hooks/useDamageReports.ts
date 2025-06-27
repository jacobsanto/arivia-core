
import { useState, useEffect } from 'react';
import { DamageReport, DamageService } from '@/services/damage/damage.service';
import { toast } from 'sonner';

export const useDamageReports = () => {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DamageService.getDamageReports();
      setReports(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch damage reports';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    isLoading,
    error,
    refetch: fetchReports
  };
};
