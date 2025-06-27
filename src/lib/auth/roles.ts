
import { UserRole } from "@/types/auth";

// Role hierarchy and utilities
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 100,
  tenant_admin: 90,
  property_manager: 70,
  inventory_manager: 50,
  concierge: 40,
  maintenance_staff: 30,
  housekeeping_staff: 20
};

export const getRoleLevel = (role: UserRole): number => {
  return ROLE_HIERARCHY[role] || 0;
};

export const isHigherRole = (role1: UserRole, role2: UserRole): boolean => {
  return getRoleLevel(role1) > getRoleLevel(role2);
};

export const canManageRole = (managerRole: UserRole, targetRole: UserRole): boolean => {
  // Superadmin can manage all roles
  if (managerRole === 'superadmin') return true;
  
  // Tenant admin can manage all except superadmin
  if (managerRole === 'tenant_admin' && targetRole !== 'superadmin') return true;
  
  // Property managers can manage staff roles
  if (managerRole === 'property_manager') {
    return ['housekeeping_staff', 'maintenance_staff', 'concierge'].includes(targetRole);
  }
  
  return false;
};

export const getDefaultRoleForNewUser = (): UserRole => {
  return 'property_manager';
};

export const getAllowedRolesForUser = (userRole: UserRole): UserRole[] => {
  switch (userRole) {
    case 'superadmin':
      return Object.keys(ROLE_HIERARCHY) as UserRole[];
    
    case 'tenant_admin':
      return [
        'tenant_admin',
        'property_manager',
        'inventory_manager',
        'concierge',
        'maintenance_staff',
        'housekeeping_staff'
      ];
    
    case 'property_manager':
      return [
        'property_manager',
        'concierge',
        'maintenance_staff',
        'housekeeping_staff'
      ];
    
    default:
      return [userRole]; // Users can only see their own role
  }
};
