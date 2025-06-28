
export type UserRole = 
  | 'superadmin'
  | 'tenant_admin'
  | 'property_manager'
  | 'housekeeping_staff'
  | 'maintenance_staff'
  | 'inventory_manager'
  | 'concierge';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  secondaryRoles?: UserRole[];
  customPermissions?: Record<string, boolean>;
}

export interface TenantUser extends User {
  tenantId: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: TenantSettings;
}

export interface TenantSettings {
  allowRegistration: boolean;
  defaultRole: UserRole;
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

// Permission system
export interface FeaturePermission {
  title: string;
  description: string;
  category: string;
  allowedRoles: UserRole[];
}

export const FEATURE_PERMISSIONS: Record<string, FeaturePermission> = {
  viewDashboard: {
    title: 'View Dashboard',
    description: 'Access to main dashboard',
    category: 'Dashboard',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager', 'concierge']
  },
  viewProperties: {
    title: 'View Properties',
    description: 'View property listings',
    category: 'Properties',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager', 'concierge']
  },
  manageProperties: {
    title: 'Manage Properties',
    description: 'Create, edit, and delete properties',
    category: 'Properties',
    allowedRoles: ['superadmin', 'tenant_admin']
  },
  viewAllTasks: {
    title: 'View All Tasks',
    description: 'View all system tasks',
    category: 'Tasks',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager']
  },
  viewAssignedTasks: {
    title: 'View Assigned Tasks',
    description: 'View tasks assigned to user',
    category: 'Tasks',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'concierge']
  },
  assignTasks: {
    title: 'Assign Tasks',
    description: 'Assign tasks to team members',
    category: 'Tasks',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager']
  },
  viewInventory: {
    title: 'View Inventory',
    description: 'View inventory levels and items',
    category: 'Inventory',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager', 'inventory_manager', 'housekeeping_staff', 'maintenance_staff']
  },
  manageInventory: {
    title: 'Manage Inventory',
    description: 'Add, edit, and manage inventory items',
    category: 'Inventory',
    allowedRoles: ['superadmin', 'tenant_admin', 'inventory_manager']
  },
  approveTransfers: {
    title: 'Approve Transfers',
    description: 'Approve inventory transfers',
    category: 'Inventory',
    allowedRoles: ['superadmin', 'tenant_admin', 'inventory_manager']
  },
  viewUsers: {
    title: 'View Users',
    description: 'View user profiles',
    category: 'Users',
    allowedRoles: ['superadmin', 'tenant_admin']
  },
  manageUsers: {
    title: 'Manage Users',
    description: 'Create, edit, and manage user accounts',
    category: 'Users',
    allowedRoles: ['superadmin', 'tenant_admin']
  },
  viewReports: {
    title: 'View Reports',
    description: 'Access to system reports',
    category: 'Reports',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager', 'inventory_manager']
  },
  viewChat: {
    title: 'View Chat',
    description: 'Access to chat functionality',
    category: 'Communication',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'inventory_manager', 'concierge']
  },
  view_damage_reports: {
    title: 'View Damage Reports',
    description: 'Access to damage reports',
    category: 'Reports',
    allowedRoles: ['superadmin', 'tenant_admin', 'property_manager']
  }
};

// Role details
export const ROLE_DETAILS: Record<UserRole, { title: string; description: string }> = {
  superadmin: {
    title: 'Super Admin',
    description: 'Full system access with all permissions'
  },
  tenant_admin: {
    title: 'Admin',
    description: 'Administrative access to tenant resources'
  },
  property_manager: {
    title: 'Property Manager',
    description: 'Manages properties and oversees operations'
  },
  housekeeping_staff: {
    title: 'Housekeeping Staff',
    description: 'Handles cleaning and maintenance tasks'
  },
  maintenance_staff: {
    title: 'Maintenance Staff',
    description: 'Handles repairs and technical maintenance'
  },
  inventory_manager: {
    title: 'Inventory Manager',
    description: 'Manages inventory and supplies'
  },
  concierge: {
    title: 'Concierge',
    description: 'Guest services and support'
  }
};

export const safeRoleCast = (role: string): UserRole => {
  const validRoles: UserRole[] = [
    'superadmin',
    'tenant_admin', 
    'property_manager',
    'housekeeping_staff',
    'maintenance_staff', 
    'inventory_manager',
    'concierge'
  ];
  
  return validRoles.includes(role as UserRole) ? (role as UserRole) : 'property_manager';
};

// Convert UserProfile to User type
export const profileToUser = (profile: any): User => {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: safeRoleCast(profile.role),
    phone: profile.phone,
    avatar: profile.avatar,
    secondaryRoles: profile.secondary_roles?.map((role: string) => safeRoleCast(role)),
    customPermissions: profile.custom_permissions || {}
  };
};
