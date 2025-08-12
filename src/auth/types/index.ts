/**
 * Consolidated authentication types for Arivia Villas Operations
 */
import { Session as SupabaseSession, User as SupabaseUser } from "@supabase/supabase-js";

// Core user interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  secondaryRoles?: UserRole[];
  avatar?: string;
  phone?: string;
  customPermissions?: Record<string, boolean>;
}

// Session interface compatible with Supabase
export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: SupabaseUser;
}

// User roles enum - matches existing database schema
export type UserRole = 
  | "superadmin"
  | "administrator" 
  | "property_manager" 
  | "concierge" 
  | "housekeeping_staff" 
  | "maintenance_staff" 
  | "inventory_manager"
  | "housekeeper"
  | "manager"
  | "pool_service"
  | "external_partner";

// Authentication state
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Authentication operations
export interface AuthOperations {
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshAuthState: () => Promise<void>;
}

// Profile operations
export interface ProfileOperations {
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteUserProfile: (userId: string) => Promise<void>;
}

// Permission operations
export interface PermissionOperations {
  checkFeatureAccess: (featureKey: string) => boolean;
  checkRolePermission: (roles: UserRole[]) => boolean;
  updateUserPermissions: (userId: string, permissions: Record<string, boolean>) => Promise<void>;
  getOfflineLoginStatus: () => boolean;
}

// Combined auth context interface
export interface AuthContextType extends AuthState, AuthOperations, ProfileOperations, PermissionOperations {
  // Legacy compatibility
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean; // alias for isLoading
}

// Feature permissions configuration
export interface FeaturePermission {
  key: string;
  title: string;
  description: string;
  allowedRoles: UserRole[];
  requiresCustomPermission?: boolean;
}

// Role details for UI display
export interface RoleDetails {
  title: string;
  description: string;
  permissions: string[];
  color: string;
}

// Type for React state setter functions
export type StateSetter<T> = (value: T | ((prev: T) => T)) => void;
export type UserStateSetter = StateSetter<User | null>;

// Constants
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 100,
  administrator: 90,
  property_manager: 80,
  concierge: 70,
  maintenance_staff: 60,
  housekeeping_staff: 50,
  inventory_manager: 55,
  housekeeper: 50,
  manager: 70,
  pool_service: 40,
  external_partner: 30,
};

export const ROLE_DETAILS: Record<UserRole, RoleDetails> = {
  superadmin: {
    title: "Super Administrator",
    description: "Full system access and control",
    permissions: ["all"],
    color: "destructive"
  },
  administrator: {
    title: "Administrator", 
    description: "System administration and user management",
    permissions: ["user_management", "system_settings", "reports"],
    color: "destructive"
  },
  property_manager: {
    title: "Property Manager",
    description: "Property operations and staff coordination",
    permissions: ["property_management", "staff_coordination", "reports"],
    color: "default"
  },
  concierge: {
    title: "Concierge",
    description: "Guest services and property coordination",
    permissions: ["guest_services", "property_access"],
    color: "secondary"
  },
  housekeeping_staff: {
    title: "Housekeeping Staff",
    description: "Cleaning and maintenance tasks",
    permissions: ["task_management", "inventory_access"],
    color: "outline"
  },
  maintenance_staff: {
    title: "Maintenance Staff", 
    description: "Property maintenance and repairs",
    permissions: ["maintenance_tasks", "inventory_access"],
    color: "outline"
  },
  inventory_manager: {
    title: "Inventory Manager",
    description: "Inventory tracking and supply management",
    permissions: ["inventory_management", "ordering"],
    color: "outline"
  },
  housekeeper: {
    title: "Housekeeper",
    description: "Cleaning and housekeeping operations",
    permissions: ["cleaning_tasks", "inventory_access"],
    color: "outline"
  },
  manager: {
    title: "Manager",
    description: "Operational management and oversight",
    permissions: ["team_management", "operations"],
    color: "default"
  },
  pool_service: {
    title: "Pool Service",
    description: "Pool maintenance and chemical management",
    permissions: ["pool_maintenance"],
    color: "outline"
  },
  external_partner: {
    title: "External Partner",
    description: "Limited access for service providers",
    permissions: ["limited_access"],
    color: "outline"
  }
};