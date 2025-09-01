import { useUser } from '@/contexts/UserContext';
import { checkFeatureAccess } from '@/services/auth/permissionService';
import { FEATURE_PERMISSIONS, OFFLINE_CAPABILITIES, getAllPermissionKeys } from '@/types/auth';

export const usePermissions = () => {
  const { user } = useUser();

  const canAccess = (featureKey: string): boolean => {
    try {
      if (!user) {
        console.warn('No user found in usePermissions');
        return false;
      }
      
      if (!checkFeatureAccess) {
        console.error('checkFeatureAccess function not found');
        return false;
      }
      
      return checkFeatureAccess(user, featureKey);
    } catch (error) {
      console.error('Error in canAccess:', error, { featureKey, user });
      return false;
    }
  };

  const getOfflineCapabilities = () => {
    try {
      if (!user) return [];
      
      return OFFLINE_CAPABILITIES[user.role] || [];
    } catch (error) {
      console.error('Error in getOfflineCapabilities:', error);
      return [];
    }
  };

  const getAllPermissionsList = () => {
    try {
      return getAllPermissionKeys();
    } catch (error) {
      console.error('Error in getAllPermissionsList:', error);
      return [];
    }
  };

  return {
    canAccess,
    getOfflineCapabilities,
    getAllPermissionsList
  };
};