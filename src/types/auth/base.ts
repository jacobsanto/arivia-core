
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
