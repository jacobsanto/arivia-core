import React, { createContext, useContext, useState } from "react";
import { User, UserRole, Session } from "@/types/auth";
import { UserContextType } from "./types/userContext.types";
import { useAuth } from "./AuthContext";
import { useDevMode } from "./DevModeContext";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";
import { checkFeatureAccess, checkRolePermission } from "@/services/auth/permissionService";
import { profileRefreshLimiter } from "@/services/profileRefreshLimiter";
import { logger } from "@/services/logger";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Single source of truth from AuthContext
  const { user: authUser, session, isLoading: authLoading, refreshAuthState } = useAuth();

  // Dev mode (safe access)
  const devMode = (() => {
    try {
      return useDevMode();
    } catch {
      return null;
    }
  })();

  // Local, non-authoritative helpers
  const [localLoading, setLocalLoading] = useState(false);
  const [lastAuthTime, setLastAuthTime] = useState<number>(Number(localStorage.getItem("lastAuthTime") || 0));

  // Determine current user (prefer mock when enabled in dev mode)
  const currentUser: User | null =
    devMode?.isDevMode && devMode.settings.enableMockUsers && devMode.currentMockUser
      ? devMode.currentMockUser
      : authUser;

  const currentSession: Session | null = session;
  const currentIsLoading = authLoading || localLoading;

  // Actions
  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      setLocalLoading(true);

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const now = Date.now();
      setLastAuthTime(now);
      localStorage.setItem("lastAuthTime", String(now));

      // Let AuthContext pick up the session change
      await refreshAuthState();
      toastService.success("Signed in", { description: "Welcome back" });
    } catch (err) {
      let message = "Invalid credentials";
      if (err instanceof Error) {
        if (err.message.includes("Invalid login credentials")) message = "Invalid email or password";
        else if (err.message.includes("Too many requests")) message = "Too many attempts. Try again later.";
        else if (err.message.includes("Email not confirmed")) message = "Please confirm your email first";
        else message = err.message;
      }
      toastService.error("Login failed", { description: message });
      throw err;
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSignup = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "property_manager"
  ) => {
    try {
      setLocalLoading(true);

      // Prevent multiple superadmins
      if (role === "superadmin") {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "superadmin")
          .maybeSingle();
        if (existing) {
          throw new Error("Super Admin role already exists. Only one Super Admin account can be created.");
        }
      }

      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { name: fullName, role }
        }
      });
      if (error) throw error;

      const now = Date.now();
      setLastAuthTime(now);
      localStorage.setItem("lastAuthTime", String(now));

      toastService.success("Account created", { description: "Please check your email to complete signup" });
      return true;
    } catch (err) {
      let message = "An error occurred during signup";
      if (err instanceof Error) {
        if (err.message.includes("already registered")) message = "Email already registered. Please sign in.";
        else if (err.message.toLowerCase().includes("password")) message = "Password must meet requirements.";
        else message = err.message;
      }
      toastService.error("Signup failed", { description: message });
      return false;
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
      localStorage.removeItem("lastAuthTime");
      toastService.success("Signed out");
    } catch (err) {
      toastService.error("Failed to sign out", { description: err instanceof Error ? err.message : "" });
    } finally {
      // Hard redirect to clear any residual state
      window.location.href = "/login";
    }
  };

  const handleHasPermission = (roles: UserRole[]) => checkRolePermission(currentUser, roles);
  const handleHasFeatureAccess = (featureKey: string) => checkFeatureAccess(currentUser, featureKey);

  const handleGetOfflineLoginStatus = () => {
    const isOffline = !navigator.onLine;
    const isOfflineLoggedIn = !!currentUser && isOffline && Date.now() - lastAuthTime < 7 * 24 * 60 * 60 * 1000;
    return { isOfflineLoggedIn, timeRemaining: 0 };
  };

  const handleUpdateUserPermissions = async (userId: string, permissions: Record<string, boolean>) => {
    try {
      if (currentUser?.role !== "superadmin") {
        toastService.error("Permission denied", { description: "Only Super Admins can modify permissions" });
        return false;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ custom_permissions: permissions })
        .eq("id", userId);
      if (error) throw error;

      if (currentUser?.id === userId) await refreshAuthState();
      toastService.success("Permissions updated");
      return true;
    } catch (err) {
      logger.error("UserContext", "Failed to update permissions", { error: err });
      toastService.error("Failed to update permissions", { description: err instanceof Error ? err.message : "" });
      return false;
    }
  };

  const handleUpdateUserAvatar = async (userId: string, avatarUrl: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;

      if (currentUser?.id === userId) await refreshAuthState();
      toastService.success("Avatar updated");
      return true;
    } catch (err) {
      toastService.error("Failed to update avatar", { description: err instanceof Error ? err.message : "" });
      return false;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (currentUser?.role !== "superadmin") {
        toastService.error("Permission denied", { description: "Only Super Admins can delete users" });
        return false;
      }
      if (currentUser?.id === userId) {
        toastService.error("Cannot delete your own account");
        return false;
      }

      const { error } = await supabase.functions.invoke("delete-user", { body: { userId } });
      if (error) throw new Error(error.message || "Failed to delete user");

      toastService.success("User deleted");
      return true;
    } catch (err) {
      toastService.error("Failed to delete user", { description: err instanceof Error ? err.message : "" });
      return false;
    }
  };

  const handleSyncUserProfile = async () => {
    try {
      await refreshAuthState();
      return true;
    } catch (err) {
      return false;
    }
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
      const dbProfileData: any = {
        ...profileData,
        secondary_roles: profileData.secondaryRoles,
        custom_permissions: profileData.customPermissions
      };
      delete dbProfileData.secondaryRoles;
      delete dbProfileData.customPermissions;

      const { error } = await supabase
        .from("profiles")
        .update(dbProfileData)
        .eq("id", userId);
      if (error) throw error;

      if (currentUser?.id === userId) await refreshAuthState();
      toastService.success("Profile updated");
      return true;
    } catch (err) {
      toastService.error("Failed to update profile", { description: err instanceof Error ? err.message : "" });
      return false;
    }
  };

  const handleRefreshProfile = async () => {
    if (devMode?.isDevMode && devMode.settings.enableMockUsers && devMode.currentMockUser) {
      logger.debug("UserContext", "Skipping profile refresh for mock user");
      return true;
    }

    if (currentUser && !profileRefreshLimiter.canRefresh(currentUser.id)) {
      const status = profileRefreshLimiter.getRefreshStatus(currentUser.id);
      logger.debug("UserContext", "Profile refresh rate limited", {
        userId: currentUser.id,
        nextAllowedTime: status.nextAllowedTime,
      });
      return false;
    }

    const success = await handleSyncUserProfile();
    if (success && currentUser) profileRefreshLimiter.recordRefresh(currentUser.id);
    return success;
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
