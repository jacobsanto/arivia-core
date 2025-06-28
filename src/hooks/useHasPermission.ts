
import { useUser } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useHasPermission = (permissionKey: string): boolean => {
  const { user } = useUser();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (!user?.id) {
        setHasPermission(false);
        return;
      }

      try {
        // Get user's roles and their permissions
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            roles!inner(
              role_permissions!inner(
                permissions!inner(key)
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.error('Error checking permission:', error);
          setHasPermission(false);
          return;
        }

        // Check if user has the permission
        const userHasPermission = data?.some(userRole => 
          userRole.roles.role_permissions.some(rp => 
            rp.permissions.key === permissionKey
          )
        ) || false;

        setHasPermission(userHasPermission);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, [user?.id, permissionKey]);

  return hasPermission;
};
