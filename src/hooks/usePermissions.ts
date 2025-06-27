
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/types/auth";

export const usePermissions = () => {
  const { user } = useUser();

  const canAccess = (feature: string): boolean => {
    if (!user) return false;
    
    // Basic role-based access control
    switch (user.role) {
      case 'superadmin':
        return true;
      case 'tenant_admin':
        return !feature.includes('manage_tenants');
      case 'property_manager':
        return ['manage_properties', 'assign_tasks', 'view_reports', 'viewProperties', 'manageProperties', 'viewAllTasks', 'assignTasks'].includes(feature);
      case 'housekeeping_staff':
        return ['viewAssignedTasks', 'viewInventory'].includes(feature);
      case 'maintenance_staff':
        return ['viewAssignedTasks', 'viewInventory'].includes(feature);
      case 'concierge':
        return ['viewAssignedTasks', 'viewProperties'].includes(feature);
      case 'inventory_manager':
        return ['viewInventory', 'manageInventory', 'approveTransfers'].includes(feature);
      default:
        return false;
    }
  };

  const getOfflineCapabilities = (): string[] => {
    if (!user) return [];
    
    const capabilities: string[] = [];
    
    switch (user.role) {
      case 'superadmin':
      case 'tenant_admin':
        capabilities.push(
          'View all data',
          'Create tasks offline',
          'Update task status',
          'Access reports'
        );
        break;
      case 'property_manager':
        capabilities.push(
          'View properties',
          'Create tasks',
          'Update task status',
          'View reports'
        );
        break;
      case 'housekeeping_staff':
      case 'maintenance_staff':
        capabilities.push(
          'View assigned tasks',
          'Update task status',
          'Add task comments'
        );
        break;
      case 'concierge':
        capabilities.push(
          'View guest requests',
          'Update task status',
          'View property info'
        );
        break;
      case 'inventory_manager':
        capabilities.push(
          'View inventory',
          'Update stock levels',
          'Create orders'
        );
        break;
    }
    
    return capabilities;
  };

  const getAllPermissionsList = (): string[] => {
    return [
      'viewProperties',
      'manageProperties',
      'viewAllTasks',
      'viewAssignedTasks',
      'assignTasks',
      'viewInventory',
      'manageInventory',
      'approveTransfers',
      'viewUsers',
      'manageUsers',
      'manageSettings',
      'viewReports'
    ];
  };

  return { 
    canAccess, 
    getOfflineCapabilities,
    getAllPermissionsList
  };
};
