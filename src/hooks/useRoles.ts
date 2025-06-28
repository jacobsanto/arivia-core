
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Role } from '@/types/role-permission';
import { toast } from 'sonner';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to fetch roles');
        return;
      }

      setRoles(data || []);
    } catch (error) {
      console.error('Error in fetchRoles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        console.error('Error deleting role:', error);
        toast.error('Failed to delete role');
        return;
      }

      toast.success('Role deleted successfully');
      fetchRoles(); // Refresh the list
    } catch (error) {
      console.error('Error in deleteRole:', error);
      toast.error('Failed to delete role');
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    isLoading,
    deleteRole,
    refetch: fetchRoles
  };
};
