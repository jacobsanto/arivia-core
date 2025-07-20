
import { useUser } from '@/contexts/UserContext';
import { useDevMode } from '@/contexts/DevModeContext';
import { useEffect, useState } from 'react';
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
  
  // Get dev mode context safely
  const devMode = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDevMode();
    } catch {
      return null;
    }
  })();
  
  // Force re-calculation when mock user changes
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  useEffect(() => {
    const handleMockUserUpdate = () => {
      console.log('🔧 usePermissions: Mock user update, recalculating permissions');
      setUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('mockUserStateUpdate', handleMockUserUpdate);
    return () => {
      window.removeEventListener('mockUserStateUpdate', handleMockUserUpdate);
    };
  }, []);

  // Get the effective user (prioritizing mock user in dev mode)
  const getEffectiveUser = () => {
    if (devMode?.isDevMode && devMode.settings.enableMockUsers && devMode.currentMockUser) {
      console.log('🔧 usePermissions: Using mock user for permissions:', devMode.currentMockUser.name, devMode.currentMockUser.role);
      return devMode.currentMockUser;
    }
    return user;
  };

  const effectiveUser = getEffectiveUser();
  
  // Check if user has access to a specific feature
  const canAccess = (featureKey: string): boolean => {
    if (!effectiveUser) {
      console.log('🔧 usePermissions: No effective user, denying access to:', featureKey);
      return false;
    }
    
    // Superadmin always has access to everything
    if (effectiveUser.role === "superadmin") {
      console.log('🔧 usePermissions: Superadmin access granted for:', featureKey);
      return true;
    }
    
    // Check custom permissions first if they exist
    if (effectiveUser.customPermissions && effectiveUser.customPermissions[featureKey] !== undefined) {
      const hasCustomAccess = effectiveUser.customPermissions[featureKey];
      console.log('🔧 usePermissions: Custom permission for', featureKey, ':', hasCustomAccess);
      return hasCustomAccess;
    }
    
    // Check if feature exists in permissions
    const permission = FEATURE_PERMISSIONS[featureKey];
    if (!permission) {
      console.log('🔧 usePermissions: Feature not found:', featureKey);
      return false;
    }
    
    // Check if user's role is in the allowed roles, including secondary roles
    const hasAccess = hasPermissionWithAllRoles(effectiveUser.role, effectiveUser.secondaryRoles, permission.allowedRoles);
    console.log('🔧 usePermissions: Role-based access for', featureKey, ':', hasAccess, 'user role:', effectiveUser.role);
    return hasAccess;
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
    if (!effectiveUser) return [];
    
    let capabilities = OFFLINE_CAPABILITIES[effectiveUser.role] || [];
    
    // If user has secondary roles, add those capabilities
    if (effectiveUser.secondaryRoles && effectiveUser.secondaryRoles.length > 0) {
      effectiveUser.secondaryRoles.forEach(role => {
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
    if (!effectiveUser) return false;
    
    // Superadmin has access to all offline capabilities
    if (effectiveUser.role === 'superadmin') return true;
    
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
