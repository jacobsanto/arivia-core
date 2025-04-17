
import React, { createContext, useContext } from "react";
import { User, UserRole, Session, UserStateSetter } from "@/types/auth";
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
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to use the central auth state but don't fail if not available
  let authState: { user: User | null; session: Session | null; isLoading: boolean } = { 
    user: null, 
    session: null, 
    isLoading: false 
  };
  
  try {
    authState = useAuth();
  } catch (error) {
    // If AuthContext is not available, we'll just use our local state
    console.warn("AuthContext not available, using local state only");
  }
  
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

  // Override the local user state with the one from AuthContext to ensure consistency
  const currentUser = authState.user || user;
  const currentSession = authState.session || session;
  const currentIsLoading = authState.isLoading || isLoading;

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
    return hasPermission(currentUser, roles);
  };

  const handleHasFeatureAccess = (featureKey: string) => {
    return hasFeatureAccess(currentUser, featureKey);
  };

  const handleUpdateUserPermissions = (userId: string, permissions: Record<string, boolean>) => {
    return updatePermissions(currentUser, users, setUsers, setUser as UserStateSetter, userId, permissions);
  };

  const handleGetOfflineLoginStatus = () => {
    const status = getOfflineLoginStatus(currentUser, lastAuthTime, isOffline);
    return {
      isOfflineLoggedIn: status,
      timeRemaining: 0  // Since the original function doesn't calculate time remaining, we'll default to 0
    };
  };
  
  const handleUpdateUserAvatar = async (userId: string, avatarUrl: string) => {
    return await updateAvatar(userId, avatarUrl, users, setUsers, setUser as UserStateSetter, currentUser);
  };
  
  const handleDeleteUser = async (userId: string) => {
    return await removeUser(currentUser, users, setUsers, userId);
  };

  const handleSyncUserProfile = async () => {
    if (currentUser) {
      return await syncUserWithProfile(currentUser.id, setUser as UserStateSetter, currentUser);
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
    return await updateUserProfile(userId, profileData, setUser as UserStateSetter, currentUser);
  };
  
  const handleRefreshProfile = async () => {
    if (!navigator.onLine) {
      toast.warning("You're offline", {
        description: "Profile cannot be refreshed while offline"
      });
      return false;
    }
    
    try {
      const result = await refreshUserProfile();
      if (result) {
        toast.success("Profile refreshed", {
          description: "Your profile data has been updated"
        });
      }
      return result;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast.error("Profile refresh failed", {
        description: "There was a problem updating your profile"
      });
      return false;
    }
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
