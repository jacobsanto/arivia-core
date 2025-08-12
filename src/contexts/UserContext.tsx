/**
 * Compatibility layer for UserContext
 * This file provides backward compatibility during the transition to the new auth system
 */
import { useAuth, useProfile, usePermissions } from "@/auth";

// Re-export the new auth hooks with the old names for backward compatibility
export const useUser = () => {
  const auth = useAuth();
  const profile = useProfile();
  const permissions = usePermissions();
  
  return {
    // Auth state
    user: auth.user,
    session: auth.session,
    isLoading: auth.isLoading,
    loading: auth.loading,
    
    // Auth operations (legacy names)
    login: auth.login,
    signup: async (email: string, password: string, fullName: string, role?: any) => {
      return await auth.signup(email, password, { name: fullName, role });
    },
    logout: auth.logout,
    
    // Profile operations
    updateProfile: async (userId: string, profileData: any) => {
      await profile.updateProfile(profileData);
      return true;
    },
    updateUserAvatar: async (userId: string, avatarUrl: string) => {
      await profile.updateUserAvatar(avatarUrl);
      return true;
    },
    refreshProfile: async () => {
      await profile.refreshProfile();
      return true;
    },
    deleteUser: async (userId: string) => {
      await profile.deleteUserProfile(userId);
      return true;
    },
    
    // Permission operations
    hasPermission: permissions.hasRole,
    hasFeatureAccess: permissions.canAccess,
    updateUserPermissions: async (userId: string, perms: Record<string, boolean>) => {
      await permissions.updateUserPermissions(userId, perms);
      return true;
    },
    getOfflineLoginStatus: permissions.getOfflineLoginStatus,
    
    // Additional methods for compatibility
    syncUserProfile: async () => {
      await profile.refreshProfile();
      return true;
    },
    deleteUserProfile: async (userId: string) => {
      await profile.deleteUserProfile(userId);
      return true;
    },
  };
};

// No additional exports needed - useUser is the main export