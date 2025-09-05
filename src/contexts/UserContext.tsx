import React, { createContext, useContext, useState } from "react";
import { User, UserRole, Session } from "@/types/auth";
import { UserContextType } from "./types/userContext.types";

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user for open access - you as the developer
const MOCK_ADMIN_USER: User = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "dev@ariviagroup.com",
  name: "Dev Admin",
  role: "administrator" as UserRole,
  avatar: null,
  phone: null,
  secondaryRoles: [],
  customPermissions: {}
};

const MOCK_SESSION: Session = {
  access_token: "mock-access-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "mock-refresh-token",
  user: {
    id: "00000000-0000-0000-0000-000000000000",
    email: "dev@ariviagroup.com",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: { name: "Dev Admin" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: null,
    identities: []
  } as any // Use any to avoid complex Supabase User type
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always return the mock admin user for full access
  const currentUser: User = MOCK_ADMIN_USER;
  const currentSession: Session = MOCK_SESSION;
  const currentIsLoading = false;

  // Mock actions - no actual authentication needed
  const handleLogin = async (email: string, password: string): Promise<void> => {
    console.log("Mock login - app is in open access mode");
  };

  const handleSignup = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "property_manager"
  ) => {
    console.log("Mock signup - app is in open access mode");
    return true;
  };

  const handleLogout = async () => {
    console.log("Mock logout - app is in open access mode");
  };

  const handleHasPermission = (roles: UserRole[]) => true; // Always allow
  const handleHasFeatureAccess = (featureKey: string) => true; // Always allow

  const handleGetOfflineLoginStatus = () => {
    return { isOfflineLoggedIn: true, timeRemaining: 999999 };
  };

  const handleUpdateUserPermissions = async (userId: string, permissions: Record<string, boolean>) => {
    console.log("Mock permission update - app is in open access mode");
    return true;
  };

  const handleUpdateUserAvatar = async (userId: string, avatarUrl: string) => {
    console.log("Mock avatar update - app is in open access mode");
    return true;
  };

  const handleDeleteUser = async (userId: string) => {
    console.log("Mock user deletion - app is in open access mode");
    return true;
  };

  const handleSyncUserProfile = async () => {
    console.log("Mock profile sync - app is in open access mode");
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
    console.log("Mock profile update - app is in open access mode");
    return true;
  };

  const handleRefreshProfile = async () => {
    console.log("Mock profile refresh - app is in open access mode");
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
