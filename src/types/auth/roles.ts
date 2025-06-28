
import { UserRole } from './base';

// Define default permissions for each role
export const getDefaultPermissionsForRole = (role: UserRole): Record<string, boolean> => {
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

  const permissions = rolePermissions[role] || [];
  const permissionMap: Record<string, boolean> = {};
  
  // If user has all permissions
  if (permissions.includes('*')) {
    const allPermissions = [
      'viewDashboard', 'viewProperties', 'manageProperties', 'viewAllTasks', 
      'viewAssignedTasks', 'assignTasks', 'viewInventory', 'manageInventory', 
      'approveTransfers', 'viewUsers', 'manageUsers', 'viewReports', 'viewChat', 
      'view_damage_reports'
    ];
    allPermissions.forEach(perm => permissionMap[perm] = true);
  } else {
    permissions.forEach(perm => permissionMap[perm] = true);
  }
  
  return permissionMap;
};

export { ROLE_DETAILS } from './base';
