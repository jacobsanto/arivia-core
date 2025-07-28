import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

export const useUsers = () => {
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, avatar, phone')
        .order('name');
      
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