import React, { createContext, useContext, useEffect } from "react";
import { User, UserRole } from "@/types/auth";
import { UserContextType } from "./types/userContext.types";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/services/logger';
import { useAuth } from "@/contexts/AuthContext";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get auth state from AuthContext (single source of truth)
  const { user: currentUser, session: currentSession, isLoading: currentIsLoading, signIn, signUp, signOut } = useAuth();

  // Delegate auth operations to AuthContext
  const handleLogin = async (email: string, password: string): Promise<void> => {
    const { error } = await signIn(email, password);
    if (error) throw error;
  };

  const handleSignup = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "property_manager"
  ) => {
    const { error } = await signUp(email, password, { name: fullName, role });
    return !error;
  };

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("session");
    localStorage.removeItem("authToken");
    localStorage.removeItem("lastAuthTime");
    window.location.href = "/login";
  };

  const handleHasPermission = (roles: UserRole[]) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  const handleHasFeatureAccess = (featureKey: string) => {
    if (!currentUser) return false;
    return currentUser.customPermissions[featureKey] ?? true;
  };

  const handleGetOfflineLoginStatus = () => {
    // Offline login not supported with real auth
    return { isOfflineLoggedIn: false, timeRemaining: 0 };
  };

  const handleUpdateUserPermissions = async (userId: string, permissions: Record<string, boolean>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_permissions: permissions })
        .eq('id', userId);

      if (error) throw error;
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
        .eq('id', userId);

      if (error) throw error;
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
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      return false;
    }
  };

  const handleSyncUserProfile = async () => {
    if (!currentUser) {
      logger.info('No authenticated user to sync');
      return false;
    }
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
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error updating profile:', error);
      return false;
    }
  };

  const handleRefreshProfile = async () => {
    if (!currentUser) {
      logger.info('No authenticated user to refresh');
      return false;
    }
    return true;
  };

  return (
    <UserContext.Provider
      value={{
        user: currentUser,
        session: currentSession,
        isLoading: currentIsLoading,
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
