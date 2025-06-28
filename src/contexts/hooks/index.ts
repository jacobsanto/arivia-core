
import { useUser } from '@/contexts/UserContext';
import { updatePermissions } from '@/contexts/auth/operations/permissionOperations';
import { User } from '@/types/auth';

export const usePermissionOperations = () => {
  const { user } = useUser();

  const updateUserPermissions = async (
    users: User[], 
    setUsers: (users: User[]) => void, 
    setUser: (user: User | null) => void, 
    userId: string, 
    permissions: Record<string, boolean>
  ) => {
    return await updatePermissions(
      user, 
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
