
// Re-export base types
export * from './base';

// Additional auth types
export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

// Re-export all auth types and utilities
export type { UserRole, Session } from './base';

// Additional utilities
export const isValidUserRole = (role: string): boolean => {
  return ['superadmin', 'tenant_admin', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager', 'concierge'].includes(role);
};

export const getUserRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
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
