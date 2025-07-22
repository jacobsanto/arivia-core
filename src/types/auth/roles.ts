
/**
 * Role definitions, details, and related utilities
 */
import { UserRole } from "./base";

export const ROLE_DETAILS: Record<UserRole, {
  title: string;
  description: string;
}> = {
  superadmin: {
    title: "Super Admin",
    description: "Full access to all system features, requires a secondary role"
  },
  administrator: {
    title: "Administrator",
    description: "Manage properties, staff, and system settings"
  },
  property_manager: {
    title: "Property Manager",
    description: "Manage assigned properties and staff"
  },
  concierge: {
    title: "Concierge",
    description: "Handle guest services and requests"
  },
  housekeeping_staff: {
    title: "Housekeeping Staff",
    description: "Manage cleaning and housekeeping tasks"
  },
  maintenance_staff: {
    title: "Maintenance Staff",
    description: "Handle property maintenance and repairs"
  },
  inventory_manager: {
    title: "Inventory Manager",
    description: "Manage supplies and inventory across properties"
  },
  housekeeper: {
    title: "Housekeeper",
    description: "Housekeeping services for assigned properties"
  },
  manager: {
    title: "Manager",
    description: "General management of assigned properties"
  },
  pool_service: {
    title: "Pool Service",
    description: "Pool maintenance and services"
  },
  external_partner: {
    title: "External Partner",
    description: "External service provider access"
  }
};
