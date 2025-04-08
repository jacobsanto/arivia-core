
/**
 * Core user and session type definitions
 */
import { Session as SupabaseSession, User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  secondaryRoles?: UserRole[];
  avatar?: string;
  customPermissions?: {
    [key: string]: boolean;  // Permission key to boolean (granted/denied)
  };
}

// Session interface - no longer extending SupabaseSession to avoid conflicts
export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      name?: string;
      role?: string;
      avatar?: string;
    };
  };
}

export type UserRole = 
  | "superadmin"
  | "administrator" 
  | "property_manager" 
  | "concierge" 
  | "housekeeping_staff" 
  | "maintenance_staff" 
  | "inventory_manager";
