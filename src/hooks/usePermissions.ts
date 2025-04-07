
import { useUser } from '@/contexts/auth/UserContext';
import { FEATURE_PERMISSIONS, OFFLINE_CAPABILITIES, UserRole, hasPermissionWithAllRoles } from '@/types/auth';

interface PermissionsReturn {
  canAccess: (featureKey: string) => boolean;
  getOfflineCapabilities: () => string[];
  hasOfflineAccess: (capability: string) => boolean;
}

export const usePermissions = (): PermissionsReturn => {
  const { user, hasPermission } = useUser();
  
  // Check if user has access to a specific feature
  const canAccess = (featureKey: string): boolean => {
    if (!user) return false;
    
    // Superadmin always has access to everything
    if (user.role === 'superadmin') return true;
    
    // Check if feature exists in permissions
    const permission = FEATURE_PERMISSIONS[featureKey];
    if (!permission) return false;
    
    // Check if user's role is in the allowed roles, including secondary roles
    return hasPermissionWithAllRoles(user.role, user.secondaryRoles, permission.allowedRoles);
  };

  // Get all offline capabilities for current user
  const getOfflineCapabilities = (): string[] => {
    if (!user) return [];
    
    let capabilities = OFFLINE_CAPABILITIES[user.role] || [];
    
    // If user has secondary roles, add those capabilities
    if (user.secondaryRoles && user.secondaryRoles.length > 0) {
      user.secondaryRoles.forEach(role => {
        const roleCapabilities = OFFLINE_CAPABILITIES[role] || [];
        capabilities = [...capabilities, ...roleCapabilities];
      });
      
      // Remove duplicates
      capabilities = Array.from(new Set(capabilities));
    }
    
    return capabilities;
  };

  // Check if user has a specific offline capability
  const hasOfflineAccess = (capability: string): boolean => {
    if (!user) return false;
    
    // Superadmin has access to all offline capabilities
    if (user.role === 'superadmin') return true;
    
    const capabilities = getOfflineCapabilities();
    return capabilities.includes(capability);
  };
  
  return {
    canAccess,
    getOfflineCapabilities,
    hasOfflineAccess
  };
};
