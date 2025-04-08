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

export type UserRole = "superadmin" | "administrator" | "property_manager" | "concierge" | "housekeeping_staff" | "maintenance_staff" | "inventory_manager";

export const FEATURE_PERMISSIONS: Record<string, {
  title: string;
  description: string;
  allowedRoles: UserRole[];
}> = {
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
    allowedRoles: ["superadmin", "administrator", "property_manager", "housekeeping_staff", "maintenance_staff", "inventory_manager"]
  },
  approve_orders: {
    title: "Approve Orders",
    description: "Review and approve purchase orders",
    allowedRoles: ["superadmin", "administrator", "property_manager"]
  },
  finalize_orders: {
    title: "Finalize Orders",
    description: "Final approval and sending of purchase orders",
    allowedRoles: ["superadmin", "administrator"]
  },
  viewProperties: {
    title: "View Properties",
    description: "View property listings and details",
    allowedRoles: ["superadmin", "administrator", "property_manager", "concierge"]
  },
  manageProperties: {
    title: "Manage Properties",
    description: "Create, edit, and delete property listings",
    allowedRoles: ["superadmin", "administrator", "property_manager"]
  },
  viewAllTasks: {
    title: "View All Tasks",
    description: "View all tasks across properties",
    allowedRoles: ["superadmin", "administrator", "property_manager"]
  },
  viewAssignedTasks: {
    title: "View Assigned Tasks",
    description: "View tasks assigned to you",
    allowedRoles: ["superadmin", "administrator", "property_manager", "housekeeping_staff", "maintenance_staff"]
  },
  assignTasks: {
    title: "Assign Tasks",
    description: "Assign tasks to staff members",
    allowedRoles: ["superadmin", "administrator", "property_manager"]
  },
  viewInventory: {
    title: "View Inventory",
    description: "View inventory across properties",
    allowedRoles: ["superadmin", "administrator", "property_manager", "inventory_manager"]
  },
  manageInventory: {
    title: "Manage Inventory",
    description: "Add, edit, and remove inventory items",
    allowedRoles: ["superadmin", "administrator", "property_manager", "inventory_manager"]
  },
  approveTransfers: {
    title: "Approve Transfers",
    description: "Approve inventory transfer requests",
    allowedRoles: ["superadmin", "administrator", "property_manager"]
  },
  viewUsers: {
    title: "View Users",
    description: "View user accounts",
    allowedRoles: ["superadmin", "administrator"]
  },
  manageUsers: {
    title: "Manage Users",
    description: "Create, edit, and deactivate user accounts",
    allowedRoles: ["superadmin", "administrator"]
  },
  manageSettings: {
    title: "Manage Settings",
    description: "Modify system settings and configurations",
    allowedRoles: ["superadmin", "administrator"]
  },
  viewReports: {
    title: "View Reports",
    description: "Access system reports and analytics",
    allowedRoles: ["superadmin", "administrator", "property_manager"]
  }
};

export const ROLE_DETAILS = {
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
  }
};

export const OFFLINE_CAPABILITIES = {
  superadmin: ["full_access", "manage_inventory", "view_reports", "manage_vendors", "approve_orders"],
  administrator: ["manage_properties", "manage_bookings", "manage_inventory", "view_reports", "manage_vendors", "approve_orders"],
  property_manager: ["manage_bookings", "view_reports", "create_orders", "approve_orders"],
  concierge: ["manage_bookings"],
  housekeeping_staff: ["view_tasks", "create_orders"],
  maintenance_staff: ["view_tasks", "create_orders"],
  inventory_manager: ["manage_inventory", "view_reports", "manage_vendors", "create_orders"]
};

export const hasPermissionWithAllRoles = (
  userRole: UserRole, 
  secondaryRoles: UserRole[] | undefined, 
  permissionRoles: UserRole[],
  customPermissions?: { [key: string]: boolean },
  permissionKey?: string
): boolean => {
  if (customPermissions && permissionKey && customPermissions[permissionKey] !== undefined) {
    return customPermissions[permissionKey];
  }
  
  if (permissionRoles.includes(userRole)) {
    return true;
  }
  
  if (secondaryRoles && secondaryRoles.length > 0) {
    return secondaryRoles.some(role => permissionRoles.includes(role));
  }
  
  return false;
};

export const getAllPermissionKeys = (): string[] => {
  return Object.keys(FEATURE_PERMISSIONS);
};

export const getDefaultPermissionsForRole = (role: UserRole, secondaryRoles?: UserRole[]): Record<string, boolean> => {
  const permissions: Record<string, boolean> = {};
  
  getAllPermissionKeys().forEach(permKey => {
    const permDefinition = FEATURE_PERMISSIONS[permKey];
    
    if (permDefinition) {
      const hasPermission = hasPermissionWithAllRoles(
        role, 
        secondaryRoles, 
        permDefinition.allowedRoles
      );
      
      permissions[permKey] = hasPermission;
    }
  });
  
  return permissions;
};
