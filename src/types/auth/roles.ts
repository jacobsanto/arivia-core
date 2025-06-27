
// User roles for role-based access control
export type UserRole = 
  | 'superadmin'
  | 'tenant_admin'
  | 'property_manager'
  | 'housekeeping_staff'
  | 'maintenance_staff'
  | 'inventory_manager'
  | 'concierge';

// Role details with titles and descriptions
export const ROLE_DETAILS: Record<UserRole, { title: string; description: string; permissions: string[] }> = {
  superadmin: {
    title: 'Super Administrator',
    description: 'Full system access across all tenants',
    permissions: ['*']
  },
  tenant_admin: {
    title: 'Administrator', 
    description: 'Full access within tenant organization',
    permissions: ['manage_all', 'view_all', 'assign_tasks', 'manage_users']
  },
  property_manager: {
    title: 'Property Manager',
    description: 'Manage properties, tasks, and team coordination',
    permissions: ['manage_properties', 'assign_tasks', 'view_reports', 'manage_bookings']
  },
  housekeeping_staff: {
    title: 'Housekeeping Staff',
    description: 'Handle cleaning and housekeeping tasks',
    permissions: ['view_assigned_tasks', 'update_task_status', 'view_inventory']
  },
  maintenance_staff: {
    title: 'Maintenance Staff', 
    description: 'Handle maintenance and repair tasks',
    permissions: ['view_assigned_tasks', 'update_task_status', 'view_inventory']
  },
  inventory_manager: {
    title: 'Inventory Manager',
    description: 'Manage inventory, supplies, and orders',
    permissions: ['manage_inventory', 'view_reports', 'approve_orders']
  },
  concierge: {
    title: 'Concierge',
    description: 'Guest services and coordination',
    permissions: ['view_assigned_tasks', 'view_bookings', 'update_task_status']
  }
};

export const getDefaultPermissionsForRole = (role: UserRole): Record<string, boolean> => {
  const rolePermissions = ROLE_DETAILS[role]?.permissions || [];
  
  if (rolePermissions.includes('*')) {
    return {}; // Superadmin gets all permissions by default
  }
  
  return rolePermissions.reduce((acc, permission) => {
    acc[permission] = true;
    return acc;
  }, {} as Record<string, boolean>);
};
