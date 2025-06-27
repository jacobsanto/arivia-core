
import { UserRole } from "@/types/auth";

// Permission system for role-based access control
export const PERMISSIONS = {
  // Property permissions
  PROPERTIES_VIEW: 'properties:view',
  PROPERTIES_CREATE: 'properties:create',
  PROPERTIES_UPDATE: 'properties:update',
  PROPERTIES_DELETE: 'properties:delete',
  
  // Task permissions
  TASKS_VIEW_ALL: 'tasks:view:all',
  TASKS_VIEW_ASSIGNED: 'tasks:view:assigned',
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_ASSIGN: 'tasks:assign',
  
  // Inventory permissions
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_CREATE: 'inventory:create',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_DELETE: 'inventory:delete',
  
  // User permissions
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Reports permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_CREATE: 'reports:create',
  
  // System permissions
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_ADMIN: 'system:admin'
};

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: [
    // Superadmin has all permissions
    ...Object.values(PERMISSIONS)
  ],
  
  tenant_admin: [
    PERMISSIONS.PROPERTIES_VIEW,
    PERMISSIONS.PROPERTIES_CREATE,
    PERMISSIONS.PROPERTIES_UPDATE,
    PERMISSIONS.PROPERTIES_DELETE,
    PERMISSIONS.TASKS_VIEW_ALL,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_DELETE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.SYSTEM_SETTINGS
  ],
  
  property_manager: [
    PERMISSIONS.PROPERTIES_VIEW,
    PERMISSIONS.PROPERTIES_UPDATE,
    PERMISSIONS.TASKS_VIEW_ALL,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.REPORTS_VIEW
  ],
  
  housekeeping_staff: [
    PERMISSIONS.TASKS_VIEW_ASSIGNED,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.INVENTORY_VIEW
  ],
  
  maintenance_staff: [
    PERMISSIONS.TASKS_VIEW_ASSIGNED,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.INVENTORY_VIEW
  ],
  
  inventory_manager: [
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_DELETE,
    PERMISSIONS.REPORTS_VIEW
  ],
  
  concierge: [
    PERMISSIONS.TASKS_VIEW_ASSIGNED,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.PROPERTIES_VIEW
  ]
};

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const hasAnyPermission = (userRole: UserRole, permissions: string[]): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some(permission => userPermissions.includes(permission));
};
