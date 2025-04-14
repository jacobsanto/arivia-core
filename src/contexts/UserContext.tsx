import React, { createContext, useContext } from "react";
import { User, UserRole } from "@/types/auth";
import { useUserState } from "./hooks";
import { UserContextType } from "./types/userContext.types";
import { 
  login, 
  logout, 
  hasPermission, 
  hasFeatureAccess, 
  getOfflineLoginStatus, 
  updatePermissions,
  updateAvatar,
  removeUser,
  syncUserWithProfile,
  updateUserProfile,
  signup
} from "./auth/operations";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    setUser, 
    session, 
    isLoading, 
    setIsLoading, 
    isOffline, 
    lastAuthTime, 
    setLastAuthTime, 
    users, 
    setUsers,
    refreshUserProfile
  } = useUserState();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password, setUser, setLastAuthTime, setIsLoading);
  };

  const handleSignup = async (email: string, password: string, fullName: string) => {
    await signup(email, password, fullName, setUser, setLastAuthTime, setIsLoading);
  };

  const handleLogout = async () => {
    setUser(null);
    setLastAuthTime(0);
    await logout();
  };

  const handleHasPermission = (roles: UserRole[]) => {
    return hasPermission(user, roles);
  };

  const handleHasFeatureAccess = (featureKey: string) => {
    return hasFeatureAccess(user, featureKey);
  };

  const handleUpdateUserPermissions = (userId: string, permissions: Record<string, boolean>) => {
    return updatePermissions(user, users, setUsers, setUser, userId, permissions);
  };

  const handleGetOfflineLoginStatus = () => {
    const status = getOfflineLoginStatus(user, lastAuthTime, isOffline);
    return {
      isOfflineLoggedIn: status,
      timeRemaining: 0  // Since the original function doesn't calculate time remaining, we'll default to 0
    };
  };
  
  const handleUpdateUserAvatar = async (userId: string, avatarUrl: string) => {
    return await updateAvatar(userId, avatarUrl, users, setUsers, setUser, user);
  };
  
  const handleDeleteUser = async (userId: string) => {
    return await removeUser(user, users, setUsers, userId);
  };

  const handleSyncUserProfile = async () => {
    if (user) {
      return await syncUserWithProfile(user.id, setUser, user);
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
    return await updateUserProfile(userId, profileData, setUser, user);
  };
  
  const handleRefreshProfile = async () => {
    return await refreshUserProfile();
  };

  return (
    <UserContext.Provider value={{ 
      user,
      session,
      isLoading, 
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
