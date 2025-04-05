
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

// Permission structure for features in the application
export const FEATURE_PERMISSIONS: Record<string, RolePermission> = {
  // Property management features
  viewProperties: {
    title: "View Properties",
    description: "Can view property listings and details",
    allowedRoles: ["administrator", "property_manager", "concierge", "superadmin"]
  },
  manageProperties: {
    title: "Manage Properties",
    description: "Can add, edit, and delete properties",
    allowedRoles: ["administrator", "property_manager", "superadmin"]
  },
  
  // Task management
  viewAllTasks: {
    title: "View All Tasks",
    description: "Can view all tasks in the system",
    allowedRoles: ["administrator", "property_manager", "superadmin"]
  },
  viewAssignedTasks: {
    title: "View Assigned Tasks",
    description: "Can view tasks assigned to them",
    allowedRoles: ["administrator", "property_manager", "concierge", "housekeeping_staff", "maintenance_staff", "inventory_manager", "superadmin"]
  },
  assignTasks: {
    title: "Assign Tasks",
    description: "Can assign tasks to staff members",
    allowedRoles: ["administrator", "property_manager", "superadmin"]
  },
  
  // Inventory management
  viewInventory: {
    title: "View Inventory",
    description: "Can view inventory items and levels",
    allowedRoles: ["administrator", "property_manager", "housekeeping_staff", "maintenance_staff", "inventory_manager", "superadmin"]
  },
  manageInventory: {
    title: "Manage Inventory",
    description: "Can add, edit, and delete inventory items",
    allowedRoles: ["administrator", "inventory_manager", "superadmin"]
  },
  approveTransfers: {
    title: "Approve Transfers",
    description: "Can approve inventory transfer requests",
    allowedRoles: ["administrator", "property_manager", "inventory_manager", "superadmin"]
  },
  
  // User management
  viewUsers: {
    title: "View Users",
    description: "Can view user accounts",
    allowedRoles: ["administrator", "property_manager", "superadmin"]
  },
  manageUsers: {
    title: "Manage Users",
    description: "Can add, edit, and delete user accounts",
    allowedRoles: ["administrator", "superadmin"]
  },
  
  // System settings
  manageSettings: {
    title: "Manage Settings",
    description: "Can modify system configuration",
    allowedRoles: ["administrator", "superadmin"]
  },
  
  // Reports and analytics
  viewReports: {
    title: "View Reports",
    description: "Can access reports and analytics",
    allowedRoles: ["administrator", "property_manager", "superadmin"]
  }
};

// Offline capabilities by role
export const OFFLINE_CAPABILITIES: Record<UserRole, string[]> = {
  administrator: [
    "View cached properties",
    "Access offline tasks",
    "View cached inventory",
    "Complete forms and checklists",
    "Capture and queue photos",
    "Full offline access to reports"
  ],
  property_manager: [
    "View cached properties",
    "Access offline tasks",
    "View cached inventory",
    "Complete forms and checklists",
    "Capture and queue photos",
    "Offline access to key reports"
  ],
  concierge: [
    "View cached guest information",
    "Complete guest request forms",
    "Access assigned tasks",
    "Capture and queue photos"
  ],
  housekeeping_staff: [
    "Access assigned cleaning tasks",
    "Complete cleaning checklists",
    "Report inventory needs",
    "Capture and queue photos"
  ],
  maintenance_staff: [
    "Access assigned maintenance tasks",
    "Complete maintenance forms",
    "View parts inventory",
    "Document repairs with photos",
    "Capture and queue photos"
  ],
  inventory_manager: [
    "Full offline inventory access",
    "Complete inventory forms",
    "Document stock with photos",
    "Queue inventory updates"
  ],
  superadmin: [
    "Full offline access to all features",
    "Complete any form or checklist",
    "Access all cached data",
    "Priority data synchronization"
  ]
};
