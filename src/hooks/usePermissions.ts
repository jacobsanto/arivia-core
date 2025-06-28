
import { useUser } from '@/contexts/UserContext';

export const usePermissions = () => {
  const { user } = useUser();

  const canAccess = (permission: string): boolean => {
    if (!user) return false;

    // Simple role-based permission system
    const rolePermissions: Record<string, string[]> = {
      superadmin: ['*'], // All permissions
      tenant_admin: [
        'viewProperties', 'manageProperties', 'viewUsers', 'manageUsers',
        'viewAllTasks', 'assignTasks', 'viewInventory', 'manageInventory',
        'approveTransfers', 'viewReports', 'viewPermissions', 'view_damage_reports'
      ],
      property_manager: [
        'viewProperties', 'viewAllTasks', 'assignTasks', 'viewInventory', 'viewReports'
      ],
      housekeeping_staff: ['viewAssignedTasks', 'viewInventory'],
      maintenance_staff: ['viewAssignedTasks', 'viewInventory'],
      inventory_manager: ['viewInventory', 'manageInventory', 'approveTransfers', 'viewReports'],
      concierge: ['viewAssignedTasks', 'viewProperties']
    };

    const userPermissions = rolePermissions[user.role] || [];
    
    // Check for wildcard permission
    if (userPermissions.includes('*')) return true;
    
    // Check specific permission
    return userPermissions.includes(permission);
  };

  return { canAccess };
};
