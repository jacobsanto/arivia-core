
// Re-export all auth types and utilities
export type { User, UserRole, Session, StateSetter } from './auth';
export type { FeaturePermission } from './permissions';
export { USER_ROLES, FEATURE_PERMISSIONS, getDefaultPermissionsForRole, hasPermissionWithAllRoles } from './permissions';

// Additional utilities
export const isValidUserRole = (role: string): role is UserRole => {
  return ['superadmin', 'tenant_admin', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager', 'concierge'].includes(role);
};

export const getUserRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    superadmin: 'Super Admin',
    tenant_admin: 'Admin',
    property_manager: 'Property Manager',
    housekeeping_staff: 'Housekeeping Staff',
    maintenance_staff: 'Maintenance Staff',
    inventory_manager: 'Inventory Manager',
    concierge: 'Concierge'
  };
  return roleNames[role] || role;
};
