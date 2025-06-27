
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
import { checkFeatureAccess } from "@/services/auth/permissionService";
import { updatePermissions } from "./auth/operations/permissionOperations";

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
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
  const currentSession = session ? {
    ...session,
    user: session.user as any // Bridge the type gap
  } as Session : null;
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
    return await login(email, password, setUser, setLastAuthTime, currentUser);
  };

  const handleSignup = async (email: string, password: string, fullName: string, role: UserRole = "property_manager") => {
    await signup(email, password, fullName, role, setUser, setLastAuthTime, currentUser);
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
    return checkFeatureAccess(currentUser, featureKey);
  };

  const handleUpdateUserPermissions = async (userId: string, permissions: Record<string, boolean>) => {
    return await updatePermissions(currentUser, users, setUsers, setUser as StateSetter<User | null>, userId, permissions);
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
    return await removeUser(currentUser, users, setUsers, setUser as StateSetter<User | null>, userId);
  };

  const handleUpdateProfile = async (userId: string, profileData: Partial<{
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    secondaryRoles?: UserRole[];
    customPermissions?: Record<string, boolean>;
  }>) => {
    return await updateUserProfile(userId, profileData, setUser, currentUser);
  };

  const handleSyncUserProfile = async () => {
    return await syncUserWithProfile(currentUser, setUser);
  };

  const value: UserContextType = {
    user: currentUser,
    session: currentSession,
    users,
    isLoading: currentIsLoading,
    isOffline,
    lastAuthTime,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    refreshProfile: handleRefreshProfile,
    syncUserWithProfile: handleSyncUserProfile,
    updateProfile: handleUpdateProfile,
    updateAvatar: handleUpdateUserAvatar,
    deleteUser: handleDeleteUser,
    updateUserPermissions: handleUpdateUserPermissions,
    hasPermission: handleHasPermission,
    hasFeatureAccess: handleHasFeatureAccess,
    getOfflineLoginStatus: handleGetOfflineLoginStatus
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
