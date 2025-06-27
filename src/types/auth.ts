
export interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  permissions: Record<string, boolean>;
}

export type UserRole = 
  | "superadmin"
  | "tenant_admin" 
  | "property_manager" 
  | "concierge" 
  | "housekeeping_staff" 
  | "maintenance_staff" 
  | "inventory_manager"
  | "guest";

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
