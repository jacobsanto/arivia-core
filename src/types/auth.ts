
export type UserRole = 
  | "administrator" 
  | "property_manager" 
  | "concierge" 
  | "housekeeping_staff" 
  | "maintenance_staff" 
  | "inventory_manager"
  | "superadmin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface RolePermission {
  title: string;
  description: string;
  allowedRoles: UserRole[];
}

export const ROLE_DETAILS: Record<UserRole, { title: string; description: string }> = {
  administrator: {
    title: "Administrator",
    description: "Full access to all system features and settings"
  },
  property_manager: {
    title: "Property Manager",
    description: "Manage properties, bookings, and staff assignments"
  },
  concierge: {
    title: "Concierge",
    description: "Handle guest communications and special requests"
  },
  housekeeping_staff: {
    title: "Housekeeping Staff",
    description: "Access cleaning tasks and checklists"
  },
  maintenance_staff: {
    title: "Maintenance Staff",
    description: "Access repair tasks and damage reports"
  },
  inventory_manager: {
    title: "Inventory Manager",
    description: "Manage supplies and stock levels"
  },
  superadmin: {
    title: "Super Admin",
    description: "Controls everything and can assign permissions to other users"
  }
};
