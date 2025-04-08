
import React, { createContext, useContext } from "react";
import { User, UserRole } from "@/types/auth";
import { useUserState } from "./hooks/useUserState";
import { UserContextType } from "./types/userContext.types";
import { 
  login, 
  logout, 
  hasPermission, 
  hasFeatureAccess, 
  getOfflineLoginStatus, 
  updateUserPermissions as updatePermissions,
  updateUserAvatar as updateAvatar,
  deleteUser as removeUser
} from "./auth/userAuthOperations";

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
    setUsers 
  } = useUserState();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password, setUser, setLastAuthTime, setIsLoading);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleHasPermission = (roles: UserRole[]) => {
    return hasPermission(user, roles);
  };

  const handleHasFeatureAccess = (featureKey: string) => {
    return hasFeatureAccess(user, featureKey);
  };

  const handleUpdateUserPermissions = (userId: string, permissions: Record<string, boolean>) => {
    updatePermissions(user, users, setUsers, setUser, userId, permissions);
  };

  const handleGetOfflineLoginStatus = () => {
    return getOfflineLoginStatus(user, lastAuthTime, isOffline);
  };
  
  const handleUpdateUserAvatar = async (userId: string, avatarUrl: string) => {
    return await updateAvatar(userId, avatarUrl, users, setUsers, setUser, user);
  };
  
  const handleDeleteUser = async (userId: string) => {
    return await removeUser(user, users, setUsers, userId);
  };

  return (
    <UserContext.Provider value={{ 
      user,
      session,
      isLoading, 
      login: handleLogin, 
      logout: handleLogout, 
      hasPermission: handleHasPermission, 
      hasFeatureAccess: handleHasFeatureAccess,
      getOfflineLoginStatus: handleGetOfflineLoginStatus,
      updateUserPermissions: handleUpdateUserPermissions,
      updateUserAvatar: handleUpdateUserAvatar,
      deleteUser: handleDeleteUser
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
