export type AppRole = 'superadmin' | 'administrator' | 'property_manager' | 'housekeeping_staff' | 'maintenance_staff' | 'guest';

export interface SystemPermission {
  id: string;
  permission_key: string;
  permission_name: string;
  description: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role: AppRole;
  permission_key: string;
  granted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionMatrix {
  [permissionKey: string]: {
    [role in AppRole]: boolean;
  };
}

export interface PermissionCategory {
  category: string;
  permissions: SystemPermission[];
}

export const ROLE_LABELS: Record<AppRole, string> = {
  superadmin: 'Super Admin',
  administrator: 'Administrator',
  property_manager: 'Property Manager',
  housekeeping_staff: 'Housekeeping Staff',
  maintenance_staff: 'Maintenance Staff',
  guest: 'Guest'
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  superadmin: 'Full system access with unrestricted permissions',
  administrator: 'Administrative access to most system functions',
  property_manager: 'Manages properties, tasks, and operations',
  housekeeping_staff: 'Performs housekeeping tasks and basic operations',
  maintenance_staff: 'Handles maintenance tasks and equipment',
  guest: 'Limited read-only access to basic features'
};