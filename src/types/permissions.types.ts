export interface SystemPermission {
  id: string;
  permission_key: string;
  permission_name: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionData {
  permission_key: string;
  permission_name: string;
  description?: string;
  category: string;
}

export interface UpdatePermissionData {
  permission_name?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
}

export const PERMISSION_CATEGORIES = [
  'general',
  'housekeeping',
  'maintenance',
  'inventory',
  'administration',
  'reporting',
  'chat',
  'properties'
] as const;

export type PermissionCategory = typeof PERMISSION_CATEGORIES[number];

export const PERMISSION_CATEGORY_LABELS: Record<PermissionCategory, string> = {
  general: 'General',
  housekeeping: 'Housekeeping',
  maintenance: 'Maintenance',
  inventory: 'Inventory',
  administration: 'Administration',
  reporting: 'Reporting',
  chat: 'Chat & Communication',
  properties: 'Properties'
};

// Backward compatibility types
export type AppRole = 'superadmin' | 'administrator' | 'property_manager' | 'housekeeping_staff' | 'maintenance_staff' | 'guest';

export const ROLE_LABELS: Record<AppRole, string> = {
  superadmin: 'Super Admin',
  administrator: 'Administrator', 
  property_manager: 'Property Manager',
  housekeeping_staff: 'Housekeeping Staff',
  maintenance_staff: 'Maintenance Staff',
  guest: 'Guest'
};

export interface PermissionMatrix {
  category: string;
  permissions: SystemPermission[];
}

export interface RolePermission {
  role: AppRole;
  permission_key: string;
  granted: boolean;
}