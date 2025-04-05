export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type UserRole = "superadmin" | "administrator" | "property_manager" | "concierge" | "housekeeping_staff" | "maintenance_staff" | "inventory_manager";

export const FEATURE_PERMISSIONS = {
  manage_properties: {
    title: "Property Management",
    description: "Create and manage property listings",
    allowedRoles: ["superadmin", "administrator", "property_manager"]
  },
  manage_bookings: {
    title: "Booking Management",
    description: "Handle reservations and guest information",
    allowedRoles: ["superadmin", "administrator", "property_manager", "concierge"]
  },
  manage_housekeeping: {
    title: "Housekeeping Management",
    description: "Assign and track housekeeping tasks",
    allowedRoles: ["superadmin", "administrator", "property_manager", "housekeeping_staff"]
  },
  manage_maintenance: {
    title: "Maintenance Management",
    description: "Create and assign maintenance tasks",
    allowedRoles: ["superadmin", "administrator", "property_manager", "maintenance_staff"]
  },
  manage_inventory: {
    title: "Inventory Management",
    description: "Track and manage inventory items",
    allowedRoles: ["superadmin", "administrator", "property_manager", "inventory_manager"]
  },
  view_reports: {
    title: "View Reports",
    description: "Access reporting dashboards",
    allowedRoles: ["superadmin", "administrator", "property_manager"]
  },
  
  manage_vendors: {
    title: "Vendor Management",
    description: "Create and manage vendor information",
    allowedRoles: ["superadmin", "administrator", "inventory_manager"]
  },
  create_orders: {
    title: "Create Orders",
    description: "Create purchase orders",
    allowedRoles: ["superadmin", "administrator", "property_manager", "inventory_manager"]
  },
  approve_orders: {
    title: "Approve Orders",
    description: "Review and approve purchase orders",
    allowedRoles: ["superadmin", "administrator"]
  },
};

export const ROLE_DETAILS = {
  superadmin: {
    title: "Super Admin",
    description: "Full access to all system features"
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
  }
};

export const OFFLINE_CAPABILITIES = {
  superadmin: ["full_access", "manage_inventory", "view_reports", "manage_vendors", "approve_orders"],
  administrator: ["manage_properties", "manage_bookings", "manage_inventory", "view_reports", "manage_vendors", "approve_orders"],
  property_manager: ["manage_bookings", "view_reports", "create_orders"],
  concierge: ["manage_bookings"],
  housekeeping_staff: ["view_tasks"],
  maintenance_staff: ["view_tasks"],
  inventory_manager: ["manage_inventory", "view_reports", "manage_vendors", "create_orders"]
};
