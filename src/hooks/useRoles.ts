
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

  const createRole = async (name: string) => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('roles')
        .insert([{ 
          name: name.trim(),
          tenant_id: crypto.randomUUID(), // Using random UUID for now
          description: `${name} role`
        }])
        .select('*');

      if (error) {
        console.error('Error creating role:', error);
        toast.error('Failed to create role');
        return;
      }

      if (data?.[0]) {
        setRoles(prev => [...prev, data[0]]);
        toast.success('Role created successfully');
      }
    } catch (error) {
      console.error('Error in createRole:', error);
      toast.error('Failed to create role');
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
    createRole,
    deleteRole,
    refetch: fetchRoles
  };
};
