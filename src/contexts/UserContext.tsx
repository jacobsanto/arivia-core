
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
  updateUserPermissions as updatePermissions 
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
      updateUserPermissions: handleUpdateUserPermissions
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
