
import { useUser } from '@/contexts/UserContext';
import { updatePermissions } from '@/contexts/auth/operations/permissionOperations';
import { profileToUser } from '@/types/auth/base';

export const usePermissionOperations = () => {
  const { user } = useUser();

  const updateUserPermissions = async (
    users: any[], 
    setUsers: (users: any[]) => void, 
    setUser: (user: any) => void, 
    userId: string, 
    permissions: Record<string, boolean>
  ) => {
    // Convert user profile to User type if needed
    const convertedUser = user ? profileToUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      secondary_roles: user.secondary_roles,
      custom_permissions: user.custom_permissions
    }) : null;

    return await updatePermissions(
      convertedUser, 
      users, 
      setUsers, 
      setUser, 
      userId, 
      permissions
    );
  };

  return {
    updateUserPermissions
  };
};
