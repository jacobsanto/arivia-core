import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole, Session, StateSetter } from "@/types/auth";
import { useUserState } from "./hooks";
import { UserContextType } from "./types/userContext.types";
import { useAuth } from "./AuthContext";
import { useDevMode } from "./DevModeContext";
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
import { logger } from "@/services/logger";
import { profileRefreshLimiter } from "@/services/profileRefreshLimiter";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, session, isLoading: authLoading, refreshAuthState } = useAuth();
  
  // Get dev mode context safely
  const devMode = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDevMode();
    } catch {
      return null;
    }
  })();
  
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

  // State to force re-renders when mock user changes
  const [mockUserUpdateTrigger, setMockUserUpdateTrigger] = useState(0);

  // Listen for mock user changes to force updates
  useEffect(() => {
    const handleMockUserUpdate = () => {
      logger.debug('UserContext', 'Mock user state update event received');
      setMockUserUpdateTrigger(prev => prev + 1);
    };

    window.addEventListener('mockUserStateUpdate', handleMockUserUpdate);
    return () => {
      window.removeEventListener('mockUserStateUpdate', handleMockUserUpdate);
    };
  }, []);

  // Determine the current user with proper priority
  const getCurrentUser = (): User | null => {
    // In dev mode with mock users enabled, prioritize mock user
    if (devMode?.isDevMode && devMode.settings.enableMockUsers && devMode.currentMockUser) {
      logger.debug('UserContext', 'Using mock user', { 
        name: devMode.currentMockUser.name, 
        role: devMode.currentMockUser.role 
      });
      return devMode.currentMockUser;
    }
    
    // Otherwise use auth user or fallback user
    const selectedUser = authUser || user;
    if (selectedUser) {
      logger.debug('UserContext', 'Using real user', { 
        name: selectedUser.name, 
        role: selectedUser.role 
      });
    }
    return selectedUser;
  };

  // Use the determined current user
  const currentUser = getCurrentUser();
  const currentSession = session;
  const currentIsLoading = authLoading || isLoading;

  // Log user changes for debugging
  useEffect(() => {
    logger.debug('UserContext', 'Current user changed', { 
      user: currentUser ? `${currentUser.name} (${currentUser.role})` : 'null' 
    });
  }, [currentUser?.id, currentUser?.role, mockUserUpdateTrigger]);

  const handleRefreshProfile = async () => {
    // Don't refresh profile for mock users
    if (devMode?.isDevMode && devMode.settings.enableMockUsers && devMode.currentMockUser) {
      logger.debug('UserContext', 'Skipping profile refresh for mock user');
      return true;
    }
    
    // Check if refresh is allowed (rate limiting)
    if (currentUser && !profileRefreshLimiter.canRefresh(currentUser.id)) {
      const status = profileRefreshLimiter.getRefreshStatus(currentUser.id);
      logger.debug('UserContext', 'Profile refresh rate limited', { 
        userId: currentUser.id,
        nextAllowedTime: status.nextAllowedTime 
      });
      return false; // Don't refresh, but don't fail
    }
    
    const success = await refreshUserProfile();
    if (success && currentUser) {
      // Record successful refresh
      profileRefreshLimiter.recordRefresh(currentUser.id);
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
    const result = checkFeatureAccess(currentUser, featureKey);
    logger.debug('UserContext', 'Feature access check', { 
      featureKey, 
      result, 
      user: currentUser?.name, 
      role: currentUser?.role 
    });
    return result;
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
