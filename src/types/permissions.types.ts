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