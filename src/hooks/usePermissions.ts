
import { useUser } from '@/contexts/UserContext';
import { FEATURE_PERMISSIONS } from '@/types/auth';

export const usePermissions = () => {
  const { user } = useUser();

  const rolePermissions: Record<string, string[]> = {
    superadmin: ['*'],
    tenant_admin: [
      'viewProperties', 'manageProperties',
      'viewUsers', 'manageUsers',
      'viewAllTasks', 'assignTasks',
      'viewInventory', 'manageInventory', 'approveTransfers',
      'viewReports', 'manageSettings'
    ],
    cleaner: ['viewAssignedTasks'],
    maintenance: ['viewAssignedTasks'],
  };

  const canAccess = (permission: string): boolean => {
    if (!user) return false;

    const defaultPermissions = rolePermissions[user.role] || [];
    const custom = user.custom_permissions || {};

    if (custom[permission] !== undefined) return custom[permission];
    if (defaultPermissions.includes('*')) return true;

    return defaultPermissions.includes(permission);
  };

  const getAllPermissionsList = (): string[] => {
    return Object.keys(FEATURE_PERMISSIONS);
  };

  const getOfflineCapabilities = (): string[] => {
    return Object.entries(FEATURE_PERMISSIONS)
      .filter(([key, val]) => val.offline_capable)
      .map(([key, val]) => val.title);
  };

  return {
    canAccess,
    getAllPermissionsList,
    getOfflineCapabilities,
  };
};
