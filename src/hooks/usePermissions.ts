
import { useUser } from '@/contexts/UserContext';
import { useDevMode } from '@/contexts/DevModeContext';
import { useEffect, useState, useMemo } from 'react';
import { 
  FEATURE_PERMISSIONS, 
  OFFLINE_CAPABILITIES, 
  UserRole, 
  hasPermissionWithAllRoles, 
  getAllPermissionKeys 
} from '@/types/auth';
import { logger } from '@/services/logger';
import { permissionCache } from '@/services/permissionCache';

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
      logger.debug('usePermissions', 'Mock user update, recalculating permissions');
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
      logger.debug('usePermissions', 'Using mock user for permissions', { 
        name: devMode.currentMockUser.name, 
        role: devMode.currentMockUser.role 
      });
      return devMode.currentMockUser;
    }
    return user;
  };

  const effectiveUser = getEffectiveUser();
  
  // Memoize permission calculations to reduce repeated work
  const permissionCalculations = useMemo(() => {
    if (!effectiveUser) {
      return {};
    }

    // Check cache first
    const cacheKey = `${effectiveUser.id}-${effectiveUser.role}`;
    const cachedPermissions = permissionCache.get(effectiveUser.id, effectiveUser.role);
    
    if (cachedPermissions) {
      return cachedPermissions;
    }

    // In Dev Mode, treat Administrator as Superadmin (full access)
    if (devMode?.isDevMode && effectiveUser.role === 'administrator') {
      const allKeys = getAllPermissionKeys();
      const devAdminPermissions: Record<string, boolean> = {};
      allKeys.forEach(k => { devAdminPermissions[k] = true; });
      permissionCache.set(effectiveUser.id, effectiveUser.role, devAdminPermissions);
      logger.debug('usePermissions', 'DevMode: granting admin full access');
      return devAdminPermissions;
    }

    // Calculate permissions for all features at once
    const permissions: Record<string, boolean> = {};
    const allFeatureKeys = getAllPermissionKeys();

    allFeatureKeys.forEach(featureKey => {
      // Superadmin always has access to everything
      if (effectiveUser.role === "superadmin") {
        permissions[featureKey] = true;
        return;
      }
      
      // Check custom permissions first if they exist
      if (effectiveUser.customPermissions && effectiveUser.customPermissions[featureKey] !== undefined) {
        permissions[featureKey] = effectiveUser.customPermissions[featureKey];
        return;
      }
      
      // Check if feature exists in permissions
      const permission = FEATURE_PERMISSIONS[featureKey];
      if (!permission) {
        permissions[featureKey] = false;
        return;
      }
      
      // Check if user's role is in the allowed roles, including secondary roles
      permissions[featureKey] = hasPermissionWithAllRoles(
        effectiveUser.role, 
        effectiveUser.secondaryRoles, 
        permission.allowedRoles
      );
    });

    // Cache the calculated permissions
    permissionCache.set(effectiveUser.id, effectiveUser.role, permissions);
    
    logger.debug('usePermissions', 'Calculated and cached permissions', { 
      userId: effectiveUser.id, 
      userRole: effectiveUser.role,
      permissionCount: Object.keys(permissions).length 
    });

    return permissions;
  }, [effectiveUser?.id, effectiveUser?.role, effectiveUser?.customPermissions, updateTrigger]);
  
  // Check if user has access to a specific feature
  const canAccess = (featureKey: string): boolean => {
    if (!effectiveUser) {
      logger.debug('usePermissions', 'No effective user, denying access', { featureKey });
      return false;
    }
    
    // Dev Mode: admin has full access
    if (devMode?.isDevMode && effectiveUser.role === 'administrator') {
      return true;
    }
    
    // Use cached/memoized permission if available
    if (permissionCalculations[featureKey] !== undefined) {
      const hasAccess = permissionCalculations[featureKey];
      logger.debug('usePermissions', 'Cached permission check', { 
        featureKey, 
        hasAccess, 
        userRole: effectiveUser.role 
      });
      return hasAccess;
    }

    // Fallback to individual calculation (shouldn't happen often)
    logger.warn('usePermissions', 'Fallback permission calculation', { featureKey });
    
    // Superadmin always has access to everything
    if (effectiveUser.role === "superadmin") {
      return true;
    }
    
    // Check custom permissions first if they exist
    if (effectiveUser.customPermissions && effectiveUser.customPermissions[featureKey] !== undefined) {
      return effectiveUser.customPermissions[featureKey];
    }
    
    // Check if feature exists in permissions
    const permission = FEATURE_PERMISSIONS[featureKey];
    if (!permission) {
      return false;
    }
    
    // Check if user's role is in the allowed roles, including secondary roles
    return hasPermissionWithAllRoles(effectiveUser.role, effectiveUser.secondaryRoles, permission.allowedRoles);
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
    
    // Dev Mode: admin inherits superadmin offline capabilities
    if (devMode?.isDevMode && effectiveUser.role === 'administrator') {
      return OFFLINE_CAPABILITIES['superadmin'] || [];
    }
    
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
    
    // Dev Mode: admin has all offline capabilities
    if (devMode?.isDevMode && effectiveUser.role === 'administrator') return true;
    
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
