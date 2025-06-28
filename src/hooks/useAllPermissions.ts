
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Permission } from '@/types/role-permission';
import { toast } from 'sonner';

export const useAllPermissions = () => {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllPermissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category, label');

      if (error) {
        console.error('Error fetching permissions:', error);
        toast.error('Failed to fetch permissions');
        return;
      }

      setAllPermissions(data || []);
    } catch (error) {
      console.error('Error in fetchAllPermissions:', error);
      toast.error('Failed to fetch permissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPermissions();
  }, []);

  return {
    allPermissions,
    isLoading,
    refetch: fetchAllPermissions
  };
};
