import { useUser } from '@/contexts/UserContext';
import { checkFeatureAccess } from '@/services/auth/permissionService';
import { FEATURE_PERMISSIONS, OFFLINE_CAPABILITIES, getAllPermissionKeys } from '@/types/auth';

export const usePermissions = () => {
  const { user } = useUser();

  const canAccess = (featureKey: string): boolean => {
    return checkFeatureAccess(user, featureKey);
  };

  const getOfflineCapabilities = () => {
    if (!user) return [];
    
    return Object.keys(OFFLINE_CAPABILITIES).filter(capability => {
      const capabilityInfo = OFFLINE_CAPABILITIES[capability];
      return capabilityInfo.allowedRoles.includes(user.role);
    });
  };

  const getAllPermissionsList = () => {
    return getAllPermissionKeys();
  };

  return {
    canAccess,
    getOfflineCapabilities,
    getAllPermissionsList
  };
};