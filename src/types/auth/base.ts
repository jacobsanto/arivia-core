
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  secondaryRoles?: UserRole[];
  customPermissions?: Record<string, boolean>;
}

export interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  permissions: Record<string, boolean>;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: User;
}

export type UserRole = 
  | "superadmin"
  | "tenant_admin" 
  | "property_manager" 
  | "concierge" 
  | "housekeeping_staff" 
  | "maintenance_staff" 
  | "inventory_manager";

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  settings: TenantSettings;
  createdAt: Date;
  isActive: boolean;
}

export interface TenantSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  features: {
    housekeeping: boolean;
    maintenance: boolean;
    inventory: boolean;
    analytics: boolean;
  };
}

export type StateSetter<T> = (value: T) => void;
