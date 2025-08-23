
import { useUser } from '@/contexts/UserContext';
import { useMemo } from 'react';
import { UserRole } from '@/types/auth';
import { logger } from '@/services/logger';

interface PermissionsReturn {
  canAccess: (featureKey: string) => boolean;
  getOfflineCapabilities: () => string[];
  hasOfflineAccess: (capability: string) => boolean;
  getAllPermissionsList: () => Array<{
    key: string;
    title: string;
    description: string;
    hasAccess: boolean;
  }>;
  // Legacy properties for backwards compatibility
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
  canViewReports: boolean;
  canViewTasks: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;
  canViewInventory: boolean;
  canEditInventory: boolean;
  canCreateInventory: boolean;
  canDeleteInventory: boolean;
  canManageOrders: boolean;
  canViewUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canManageRoles: boolean;
  canViewSystemHealth: boolean;
  canManageSettings: boolean;
  canViewSecurityLogs: boolean;
  canViewProperties: boolean;
  canEditProperties: boolean;
  canCreateProperties: boolean;
  canDeleteProperties: boolean;
  canViewFinancials: boolean;
  canManageFinancials: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  currentRole?: UserRole;
}

export const usePermissions = (): PermissionsReturn => {
  const { user } = useUser();

  logger.debug('usePermissions', `Using mock user for permissions`, {
    name: user?.name,
    role: user?.role
  });

  const permissions = useMemo(() => {
    // In open access mode, all permissions are granted
    return {
      canViewDashboard: true,
      canViewAnalytics: true,
      canViewReports: true,
      canViewTasks: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canAssignTasks: true,
      canViewInventory: true,
      canEditInventory: true,
      canCreateInventory: true,
      canDeleteInventory: true,
      canManageOrders: true,
      canViewUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canManageRoles: true,
      canViewSystemHealth: true,
      canManageSettings: true,
      canViewSecurityLogs: true,
      canViewProperties: true,
      canEditProperties: true,
      canCreateProperties: true,
      canDeleteProperties: true,
      canViewFinancials: true,
      canManageFinancials: true,
    };
  }, [user]);

  const canAccess = (featureKey: string): boolean => {
    // In open access mode, all features are accessible
    return true;
  };

  const getAllPermissionsList = () => {
    // Return all permissions as granted
    const allPermissions = [
      'viewDashboard', 'viewAnalytics', 'viewReports',
      'viewTasks', 'createTasks', 'editTasks', 'deleteTasks', 'assignTasks',
      'viewInventory', 'editInventory', 'createInventory', 'deleteInventory', 'manageOrders',
      'viewUsers', 'editUsers', 'deleteUsers', 'manageRoles',
      'viewSystemHealth', 'manageSettings', 'viewSecurityLogs',
      'viewProperties', 'editProperties', 'createProperties', 'deleteProperties',
      'viewFinancials', 'manageFinancials'
    ];

    return allPermissions.map(key => ({
      key,
      title: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      description: `Permission to ${key}`,
      hasAccess: true
    }));
  };

  const getOfflineCapabilities = (): string[] => {
    // In open access mode, all offline capabilities are available
    return [
      'viewTasks', 'editTasks', 'viewInventory', 'viewReports',
      'viewProperties', 'viewUsers', 'viewDashboard'
    ];
  };

  const hasOfflineAccess = (capability: string): boolean => {
    // In open access mode, all offline capabilities are available
    return true;
  };

  const hasRole = (role: UserRole): boolean => {
    // In open access mode, user has all roles
    return true;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    // In open access mode, user has all roles
    return true;
  };

  return {
    ...permissions,
    canAccess,
    getOfflineCapabilities,
    hasOfflineAccess,
    getAllPermissionsList,
    hasRole,
    hasAnyRole,
    currentRole: user?.role || "administrator"
  };
};
