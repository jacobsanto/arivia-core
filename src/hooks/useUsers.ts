// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

export const useUsers = () => {
  const { user: currentUser } = useUser();

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users', currentUser?.id, currentUser?.role],
    queryFn: async () => {
      if (!currentUser) return [] as User[];

      const isManagerOrAdmin = ['superadmin', 'administrator', 'property_manager'].includes(currentUser.role);

      let query = supabase
        .from('profiles')
        .select('id, name, email, role, avatar, phone')
        .order('name');

      if (!isManagerOrAdmin) {
        query = query.eq('user_id', currentUser.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as User[];
    }
  });

  // Filter users suitable for different types of assignments
  const getAssignableUsers = (taskType?: 'maintenance' | 'housekeeping') => {
    if (!users) return [];
    
    switch (taskType) {
      case 'maintenance':
        return users.filter(user => 
          ['superadmin', 'administrator', 'property_manager', 'maintenance_staff'].includes(user.role)
        );
      case 'housekeeping':
        return users.filter(user => 
          ['superadmin', 'administrator', 'property_manager', 'housekeeping_staff'].includes(user.role)
        );
      default:
        return users;
    }
  };

  const registeredUsers = users || [];

  return {
    users: registeredUsers,
    registeredUsers,
    isLoading,
    error,
    refetch,
    getAssignableUsers
  };
};