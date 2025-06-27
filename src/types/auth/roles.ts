
import { UserRole } from './base';

export const ROLE_DETAILS: Record<UserRole, {
  title: string;
  description: string;
  color: string;
  capabilities: string[];
}> = {
  superadmin: {
    title: "Super Administrator",
    description: "Full system access and control",
    color: "text-red-600",
    capabilities: ["All system functions", "User management", "Tenant management"]
  },
  tenant_admin: {
    title: "Tenant Administrator", 
    description: "Full tenant management access",
    color: "text-purple-600",
    capabilities: ["Tenant settings", "User management", "All operations"]
  },
  property_manager: {
    title: "Property Manager",
    description: "Manages properties and operations",
    color: "text-blue-600", 
    capabilities: ["Property management", "Task assignment", "Reports"]
  },
  concierge: {
    title: "Concierge",
    description: "Customer service and support",
    color: "text-green-600",
    capabilities: ["Customer support", "Booking assistance", "Communications"]
  },
  housekeeping_staff: {
    title: "Housekeeping Staff",
    description: "Cleaning and maintenance tasks",
    color: "text-yellow-600",
    capabilities: ["Cleaning tasks", "Inventory updates", "Status reporting"]
  },
  maintenance_staff: {
    title: "Maintenance Staff", 
    description: "Property maintenance and repairs",
    color: "text-orange-600",
    capabilities: ["Maintenance tasks", "Repair requests", "Equipment management"]
  },
  inventory_manager: {
    title: "Inventory Manager",
    description: "Stock and supply management", 
    color: "text-indigo-600",
    capabilities: ["Inventory tracking", "Supply ordering", "Stock reports"]
  }
};

export const getDefaultPermissionsForRole = (role: UserRole): Record<string, boolean> => {
  const basePermissions: Record<string, boolean> = {
    'view_dashboard': true,
    'view_profile': true
  };

  switch (role) {
    case 'superadmin':
      return {
        ...basePermissions,
        'manage_users': true,
        'manage_tenants': true,
        'view_all_data': true,
        'system_settings': true
      };
    case 'tenant_admin':
      return {
        ...basePermissions,
        'manage_tenant_users': true,
        'manage_properties': true,
        'view_reports': true,
        'tenant_settings': true
      };
    case 'property_manager':
      return {
        ...basePermissions,
        'manage_properties': true,
        'assign_tasks': true,
        'view_reports': true
      };
    case 'concierge':
      return {
        ...basePermissions,
        'customer_support': true,
        'manage_bookings': true,
        'send_communications': true
      };
    case 'housekeeping_staff':
      return {
        ...basePermissions,
        'view_cleaning_tasks': true,
        'update_task_status': true,
        'manage_inventory': true
      };
    case 'maintenance_staff':
      return {
        ...basePermissions,
        'view_maintenance_tasks': true,
        'update_task_status': true,
        'manage_equipment': true
      };
    case 'inventory_manager':
      return {
        ...basePermissions,
        'manage_inventory': true,
        'create_orders': true,
        'view_inventory_reports': true
      };
    default:
      return basePermissions;
  }
};
