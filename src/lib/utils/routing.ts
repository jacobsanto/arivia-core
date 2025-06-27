
import { UserRole } from "@/types/auth";

// Define which roles are authorized for internal access
const AUTHORIZED_ROLES: UserRole[] = [
  'superadmin',
  'tenant_admin', 
  'property_manager',
  'housekeeping_staff',
  'maintenance_staff',
  'inventory_manager',
  'concierge'
];

export const isAuthorizedRole = (role: UserRole): boolean => {
  return AUTHORIZED_ROLES.includes(role);
};
