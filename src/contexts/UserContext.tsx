
import React, { createContext, useContext } from "react";
import { User, UserRole, Session, StateSetter } from "@/types/auth";
import { useUserState } from "./hooks";
import { UserContextType } from "./types/userContext.types";
import { useAuth } from "./AuthContext";
import { 
  login, 
  logout, 
  signup 
} from "./auth/operations/supabaseAuthOperations";
import {
  updateAvatar,
  removeUser,
  getOfflineLoginStatus
} from "./auth/operations/userOperations";
import {
  syncUserWithProfile,
  updateUserProfile
} from "./auth/operations/profileOperations";
import {
  hasPermissionWithAllRoles as hasPermission
} from "@/types/auth/permissions";
import { hasFeatureAccess } from "@/services/auth/permissionService";
import { updatePermissions } from "./auth/operations/permissionOperations";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, session, isLoading: authLoading, refreshAuthState } = useAuth();
  
  const { 
    user, 
    setUser, 
    isLoading, 
    setIsLoading, 
    isOffline, 
    lastAuthTime, 
    setLastAuthTime, 
    users, 
    setUsers,
    refreshUserProfile
  } = useUserState();

  // Use auth state as source of truth
  const currentUser = authUser || user;
  const currentSession = session;
  const currentIsLoading = authLoading || isLoading;

  const handleRefreshProfile = async () => {
    const success = await refreshUserProfile();
    if (success) {
      // Also refresh auth state to ensure consistency
      await refreshAuthState();
    }
    return success;
  };

  const handleLogin = async (email: string, password: string): Promise<void> => {
    return await login(email, password, setUser, setLastAuthTime, setIsLoading);
  };

  const handleSignup = async (email: string, password: string, fullName: string, role: UserRole = "property_manager") => {
    await signup(email, password, fullName, role, setUser, setLastAuthTime, setIsLoading);
  };

  const handleLogout = async () => {
    setUser(null);
    setLastAuthTime(0);
    await logout();
  };

  const handleHasPermission = (roles: UserRole[]) => {
    return hasPermission(currentUser?.role as UserRole, currentUser?.secondaryRoles, roles);
  };

  const handleHasFeatureAccess = (featureKey: string) => {
    return hasFeatureAccess(currentUser, featureKey);
  };

  const handleUpdateUserPermissions = (userId: string, permissions: Record<string, boolean>) => {
    return updatePermissions(currentUser, users, setUsers, setUser as StateSetter<User | null>, userId, permissions);
  };

  const handleGetOfflineLoginStatus = () => {
    const status = getOfflineLoginStatus(currentUser, lastAuthTime, isOffline);
    return {
      isOfflineLoggedIn: status,
      timeRemaining: 0  // Since the original function doesn't calculate time remaining, we'll default to 0
    };
  };
  
  const handleUpdateUserAvatar = async (userId: string, avatarUrl: string) => {
    return await updateAvatar(userId, avatarUrl, users, setUsers, setUser as StateSetter<User | null>, currentUser);
  };
  
  const handleDeleteUser = async (userId: string) => {
    return await removeUser(currentUser, users, setUsers, userId);
  };

  const handleSyncUserProfile = async () => {
    if (currentUser) {
      return await syncUserWithProfile(currentUser.id, setUser as StateSetter<User | null>, currentUser);
    }
    return false;
  };

  const handleUpdateProfile = async (
    userId: string,
    profileData: Partial<{
      name: string;
      email: string;
      role: UserRole;
      secondaryRoles?: UserRole[];
      customPermissions?: Record<string, boolean>;
    }>
  ) => {
    return await updateUserProfile(userId, profileData, setUser as StateSetter<User | null>, currentUser);
  };
  
  return (
    <UserContext.Provider value={{ 
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
      refreshProfile: handleRefreshProfile
    }}>
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
