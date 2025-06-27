
// Base auth types
export type { User, Session, StateSetter } from './base';
export type { Permission, PermissionCategory } from './permissions';

// Role types - single export to avoid conflicts
export type UserRole = 
  | "superadmin" 
  | "tenant_admin" 
  | "property_manager" 
  | "inventory_manager" 
  | "housekeeper" 
  | "maintenance_staff" 
  | "guest";

// Additional auth types
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  refreshAuthState: () => Promise<void>;
}
