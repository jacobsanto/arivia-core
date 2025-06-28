
import { useUser } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';

export const useHasPermission = (permissionKey: string): boolean => {
  const { user } = useUser();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (!user?.id) {
        setHasPermission(false);
        return;
      }

      // For now, use a simple role-based permission system
      // Since the database doesn't have the role-permission tables yet
      try {
        const rolePermissions: Record<string, string[]> = {
          'superadmin': ['*'], // All permissions
          'tenant_admin': [
            'viewDashboard', 'viewProperties', 'manageProperties', 'viewAllTasks', 
            'assignTasks', 'viewInventory', 'manageInventory', 'viewUsers', 
            'manageUsers', 'viewReports', 'viewChat', 'view_damage_reports'
          ],
          'property_manager': [
            'viewDashboard', 'viewProperties', 'viewAllTasks', 'assignTasks', 
            'viewInventory', 'viewReports', 'viewChat'
          ],
          'housekeeping_staff': [
            'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
          ],
          'maintenance_staff': [
            'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewInventory', 'viewChat'
          ],
          'inventory_manager': [
            'viewDashboard', 'viewInventory', 'manageInventory', 'approveTransfers', 
            'viewReports', 'viewChat'
          ],
          'concierge': [
            'viewDashboard', 'viewAssignedTasks', 'viewProperties', 'viewChat'
          ]
        };

        const userPermissions = rolePermissions[user.role] || [];
        const userHasPermission = userPermissions.includes('*') || userPermissions.includes(permissionKey);

        setHasPermission(userHasPermission);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, [user?.id, user?.role, permissionKey]);

  return hasPermission;
};
