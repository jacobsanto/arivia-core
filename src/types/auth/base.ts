
// Base auth types for the application
export type UserRole = 
  | 'superadmin'
  | 'tenant_admin'
  | 'property_manager'
  | 'housekeeping_staff'
  | 'maintenance_staff'
  | 'inventory_manager'
  | 'concierge';

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
  };
}

// Unified User interface that works with both auth systems
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | string; // Allow both enum and string for flexibility
  avatar?: string;
  phone?: string;
  secondaryRoles?: (UserRole | string)[];
  customPermissions?: Record<string, boolean>;
  custom_permissions?: Record<string, boolean>; // Database field name
}

// Add missing interfaces for tenant system
export interface Tenant {
  id: string;
  name: string;
  settings?: TenantSettings;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  theme?: string;
  features?: string[];
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface TenantUser extends User {
  tenant_id: string;
  tenant?: Tenant;
}

// Role details for UI display
export const ROLE_DETAILS: Record<UserRole, { title: string; description: string }> = {
  superadmin: {
    title: 'Super Administrator',
    description: 'Full system access with all permissions'
  },
  tenant_admin: {
    title: 'Tenant Administrator', 
    description: 'Full tenant access and user management'
  },
  property_manager: {
    title: 'Property Manager',
    description: 'Manage properties, bookings, and staff tasks'
  },
  housekeeping_staff: {
    title: 'Housekeeping Staff',
    description: 'Handle cleaning tasks and property maintenance'
  },
  maintenance_staff: {
    title: 'Maintenance Staff',
    description: 'Handle property repairs and maintenance tasks'
  },
  inventory_manager: {
    title: 'Inventory Manager',
    description: 'Manage supplies, orders, and inventory tracking'
  },
  concierge: {
    title: 'Concierge',
    description: 'Guest services and property assistance'
  }
};

// Helper function to convert UserProfile to User
export const profileToUser = (profile: any): User => {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    avatar: profile.avatar,
    phone: profile.phone,
    secondaryRoles: profile.secondary_roles,
    customPermissions: profile.custom_permissions,
    custom_permissions: profile.custom_permissions
  };
};

// Helper function to safely cast role to UserRole
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
