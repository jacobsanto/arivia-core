import React, { createContext, useContext } from "react";
import { UserRole } from "@/types/auth";
import { UserContextType } from "./types/userContext.types";
import { useAuth } from "./AuthContext";
import { logger } from '@/services/logger';
import { supabase } from "@/integrations/supabase/client";

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserContext - Legacy compatibility wrapper around AuthContext
 * This context is maintained for backwards compatibility with existing code.
 * All authentication now flows through AuthContext (Supabase Auth).
 * 
 * @deprecated Use AuthContext directly for new code
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Delegate all auth state to AuthContext
  const auth = useAuth();

  // Delegate auth actions to AuthContext
  const handleLogin = async (email: string, password: string): Promise<void> => {
    logger.auth("UserContext: Delegating login to AuthContext", email);
    await auth.signIn(email, password);
  };

  const handleSignup = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "property_manager"
  ) => {
    logger.auth("UserContext: Delegating signup to AuthContext", email);
    const result = await auth.signUp(email, password, { name: fullName, role });
    return !result.error;
  };

  const handleLogout = async () => {
    logger.auth("UserContext: Delegating logout to AuthContext");
    await auth.signOut();
  };

  const handleHasPermission = (roles: UserRole[]) => {
    // Check if user has any of the required roles
    if (!auth.user?.role) return false;
    return roles.includes(auth.user.role);
  };

  const handleHasFeatureAccess = (featureKey: string) => {
    // Check custom permissions
    return auth.user?.customPermissions?.[featureKey] ?? true;
  };

  const handleGetOfflineLoginStatus = () => {
    return { isOfflineLoggedIn: auth.isAuthenticated, timeRemaining: 999999 };
  };

  const handleUpdateUserPermissions = async (userId: string, permissions: Record<string, boolean>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_permissions: permissions })
        .eq('user_id', userId);

      if (error) throw error;
      await auth.refreshAuthState();
      return true;
    } catch (error) {
      logger.error('Error updating permissions:', error);
      return false;
    }
  };

  const handleUpdateUserAvatar = async (userId: string, avatarUrl: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar: avatarUrl })
        .eq('user_id', userId);

      if (error) throw error;
      await auth.refreshAuthState();
      return true;
    } catch (error) {
      logger.error('Error updating avatar:', error);
      return false;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      return false;
    }
  };

  const handleSyncUserProfile = async () => {
    logger.auth("UserContext: Delegating profile sync to AuthContext");
    await auth.refreshAuthState();
    return true;
  };

  const handleUpdateProfile = async (
    userId: string,
    profileData: Partial<{
      name: string;
      email: string;
      role: UserRole;
      secondaryRoles?: UserRole[];
      customPermissions?: Record<string, boolean>;
      phone?: string;
    }>
  ) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          custom_permissions: profileData.customPermissions,
        })
        .eq('user_id', userId);

      if (error) throw error;
      await auth.refreshAuthState();
      return true;
    } catch (error) {
      logger.error('Error updating profile:', error);
      return false;
    }
  };

  const handleRefreshProfile = async () => {
    logger.auth("UserContext: Delegating profile refresh to AuthContext");
    await auth.refreshAuthState();
    return true;
  };

  return (
    <UserContext.Provider
      value={{
        user: auth.user,
        session: auth.session,
        isLoading: auth.isLoading,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        hasPermission: handleHasPermission,
        hasFeatureAccess: handleHasFeatureAccess,
        getOfflineLoginStatus: handleGetOfflineLoginStatus,
        updateUserPermissions: handleUpdateUserPermissions,
        updateUserAvatar: handleUpdateUserAvatar,
        deleteUser: handleDeleteUser,
        syncUserProfile: handleSyncUserProfile,
        updateProfile: handleUpdateProfile,
        refreshProfile: handleRefreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
