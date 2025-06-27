
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/types/auth";
import { hasPermission } from "@/lib/auth/permissions";

export const usePermissions = () => {
  const { user } = useUser();

  const canAccess = (feature: string): boolean => {
    if (!user) return false;
    
    // Use the permission system
    return hasPermission(user.role, feature);
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
