
import { UserRole } from './base';

export interface FeaturePermission {
  title: string;
  description: string;
  allowedRoles: UserRole[];
  category: 'system' | 'property' | 'tasks' | 'inventory' | 'reports';
}

export const FEATURE_PERMISSIONS: Record<string, FeaturePermission> = {
  'manage_users': {
    title: 'User Management',
    description: 'Create, edit, and delete users',
    allowedRoles: ['superadmin', 'tenant_admin'],
    category: 'system'
  },
  'manage_tenants': {
    title: 'Tenant Management', 
    description: 'Manage tenant settings and configuration',
    allowedRoles: ['superadmin'],
    category: 'system'
  },
  'manage_properties': {
    title: 'Property Management',
    description: 'Add, edit, and manage properties',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager'],
    category: 'property'
  },
  'assign_tasks': {
    title: 'Task Assignment',
    description: 'Create and assign tasks to staff',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager'],
    category: 'tasks'
  },
  'view_cleaning_tasks': {
    title: 'View Cleaning Tasks',
    description: 'Access cleaning task list and details',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager', 'housekeeping_staff'],
    category: 'tasks'
  },
  'view_maintenance_tasks': {
    title: 'View Maintenance Tasks',
    description: 'Access maintenance task list and details', 
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager', 'maintenance_staff'],
    category: 'tasks'
  },
  'manage_inventory': {
    title: 'Inventory Management',
    description: 'Manage stock levels and inventory',
    allowedRoles: ['superadmin', 'tenant_admin', 'inventory_manager', 'housekeeping_staff'],
    category: 'inventory'
  },
  'view_reports': {
    title: 'View Reports',
    description: 'Access analytics and reports',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager'],
    category: 'reports'
  }
};

export const hasPermissionWithAllRoles = (
  primaryRole: UserRole, 
  secondaryRoles: UserRole[] | undefined, 
  allowedRoles: UserRole[]
): boolean => {
  if (allowedRoles.includes(primaryRole)) {
    return true;
  }
  
  if (secondaryRoles && secondaryRoles.length > 0) {
    return secondaryRoles.some(role => allowedRoles.includes(role));
  }
  
  return false;
};

export const getAllPermissionKeys = (): string[] => {
  return Object.keys(FEATURE_PERMISSIONS);
};
