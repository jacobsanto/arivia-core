
import { UserRole } from '@/types/auth/base';

// Permission checking utility
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  // Superadmin has all permissions
  if (userRole === 'superadmin') return true;
  
  // Role-based permission mapping
  const rolePermissions: Record<UserRole, string[]> = {
    superadmin: ['*'], // All permissions
    tenant_admin: [
      'viewDashboard', 'viewProperties', 'manageProperties', 'viewAllTasks', 
      'assignTasks', 'viewInventory', 'manageInventory', 'viewUsers', 
      'manageUsers', 'viewReports', 'viewChat', 'view_damage_reports'
    ],
    property_manager: [
      'viewDashboard', 'viewProperties', 'viewAllTasks', 'assignTasks', 
      'viewInventory', 'viewReports', 'viewChat'
    ],
    housekeeping_staff: [
      'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
    ],
    maintenance_staff: [
      'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
    ],
    inventory_manager: [
      'viewDashboard', 'viewInventory', 'manageInventory', 'approveTransfers', 
      'viewReports', 'viewChat'
    ],
    concierge: [
      'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewChat'
    ]
  };
  
  const userPermissions = rolePermissions[userRole] || [];
  return userPermissions.includes('*') || userPermissions.includes(permission);
};

export const getUserPermissions = (userRole: UserRole): string[] => {
  if (userRole === 'superadmin') return ['*'];
  
  const rolePermissions: Record<UserRole, string[]> = {
    superadmin: ['*'],
    tenant_admin: [
      'viewDashboard', 'viewProperties', 'manageProperties', 'viewAllTasks', 
      'assignTasks', 'viewInventory', 'manageInventory', 'viewUsers', 
      'manageUsers', 'viewReports', 'viewChat', 'view_damage_reports'
    ],
    property_manager: [
      'viewDashboard', 'viewProperties', 'viewAllTasks', 'assignTasks', 
      'viewInventory', 'viewReports', 'viewChat'
    ],
    housekeeping_staff: [
      'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
    ],
    maintenance_staff: [
      'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
    ],
    inventory_manager: [
      'viewDashboard', 'viewInventory', 'manageInventory', 'approveTransfers', 
      'viewReports', 'viewChat'
    ],
    concierge: [
      'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewChat'
    ]
  };
  
  return rolePermissions[userRole] || [];
};
