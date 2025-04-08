
import { useUser } from '@/contexts/UserContext';
import { 
  FEATURE_PERMISSIONS, 
  OFFLINE_CAPABILITIES, 
  UserRole, 
  hasPermissionWithAllRoles, 
  getAllPermissionKeys 
} from '@/types/auth';

interface PermissionsReturn {
  canAccess: (featureKey: string) => boolean;
  getOfflineCapabilities: () => string[];
  hasOfflineAccess: (capability: string) => boolean;
  getAllPermissionsList: () => Array<{
    key: string;
    title: string;
    description: string;
    hasAccess: boolean;
  }>;
}

export const usePermissions = (): PermissionsReturn => {
  const { user, hasFeatureAccess } = useUser();
  
  // Check if user has access to a specific feature
  const canAccess = (featureKey: string): boolean => {
    if (!user) return false;
    
    // Superadmin always has access to everything
    if (user.role === "superadmin") return true;
    
    // Check custom permissions first if they exist
    if (user.customPermissions && user.customPermissions[featureKey] !== undefined) {
      return user.customPermissions[featureKey];
    }
    
    // Check if feature exists in permissions
    const permission = FEATURE_PERMISSIONS[featureKey];
    if (!permission) return false;
    
    // Check if user's role is in the allowed roles, including secondary roles
    return hasPermissionWithAllRoles(user.role, user.secondaryRoles, permission.allowedRoles);
  };

  // Get all permission keys with their status for the current user
  const getAllPermissionsList = () => {
    const permissionKeys = getAllPermissionKeys();
    
    return permissionKeys.map(key => {
      const permission = FEATURE_PERMISSIONS[key];
      
      return {
        key,
        title: permission?.title || key,
        description: permission?.description || '',
        hasAccess: canAccess(key)
      };
    });
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
    hasOfflineAccess,
    getAllPermissionsList
  };
};
