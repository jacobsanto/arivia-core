/**
 * Permissions hook - handles permission checking
 */
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import { UserRole } from '../types';

export const usePermissions = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('usePermissions must be used within an AuthProvider');
  }
  
  return {
    // Permission operations
    checkFeatureAccess: context.checkFeatureAccess,
    checkRolePermission: context.checkRolePermission,
    updateUserPermissions: context.updateUserPermissions,
    getOfflineLoginStatus: context.getOfflineLoginStatus,
    
    // Convenience methods
    hasRole: (roles: UserRole[]) => context.checkRolePermission(roles),
    canAccess: (feature: string) => context.checkFeatureAccess(feature),
    isAdmin: () => context.checkRolePermission(['administrator', 'superadmin']),
    isSuperAdmin: () => context.checkRolePermission(['superadmin']),
    isManager: () => context.checkRolePermission(['property_manager', 'administrator', 'superadmin']),
  };
};