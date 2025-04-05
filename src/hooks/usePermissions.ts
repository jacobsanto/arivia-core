
import { useUser } from '@/contexts/UserContext';
import { FEATURE_PERMISSIONS, OFFLINE_CAPABILITIES, UserRole } from '@/types/auth';

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
    
    // Check if user's role is in the allowed roles
    return permission.allowedRoles.includes(user.role);
  };

  // Get all offline capabilities for current user
  const getOfflineCapabilities = (): string[] => {
    if (!user) return [];
    return OFFLINE_CAPABILITIES[user.role] || [];
  };

  // Check if user has a specific offline capability
  const hasOfflineAccess = (capability: string): boolean => {
    if (!user) return false;
    
    // Superadmin has access to all offline capabilities
    if (user.role === 'superadmin') return true;
    
    const capabilities = OFFLINE_CAPABILITIES[user.role];
    return capabilities ? capabilities.includes(capability) : false;
  };
  
  return {
    canAccess,
    getOfflineCapabilities,
    hasOfflineAccess
  };
};
