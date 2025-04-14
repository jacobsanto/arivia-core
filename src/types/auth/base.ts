
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

// Updated Session interface to correctly match Supabase's Session type
export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: SupabaseUser; // Use the full Supabase User type to ensure compatibility
}

export type UserRole = 
  | "superadmin"
  | "administrator" 
  | "property_manager" 
  | "concierge" 
  | "housekeeping_staff" 
  | "maintenance_staff" 
  | "inventory_manager";
