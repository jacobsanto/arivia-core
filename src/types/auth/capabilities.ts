
/**
 * Offline capabilities definitions and utilities
 */
import { UserRole } from "./base";

export const OFFLINE_CAPABILITIES: Record<UserRole, string[]> = {
  superadmin: ["full_access", "manage_inventory", "view_reports", "manage_vendors", "approve_orders"],
  administrator: ["manage_properties", "manage_bookings", "manage_inventory", "view_reports", "manage_vendors", "approve_orders"],
  property_manager: ["manage_bookings", "view_reports", "create_orders", "approve_orders"],
  concierge: ["manage_bookings"],
  housekeeping_staff: ["view_tasks", "create_orders"],
  maintenance_staff: ["view_tasks", "create_orders"],
  inventory_manager: ["manage_inventory", "view_reports", "manage_vendors", "create_orders"]
};
