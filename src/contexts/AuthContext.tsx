
import React, { createContext, useContext } from "react";
import { User, Session, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";
import { useDevMode } from "@/contexts/DevModeContext";
import { logger } from "@/services/logger";
import { useOptimizedAuthContext } from "@/hooks/useOptimizedAuthContext";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshAuthState: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Access dev mode context safely
  const devMode = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDevMode();
    } catch {
      // Dev mode context not available
      return null;
    }
  })();

  // Use optimized auth context for real authentication
  const optimizedAuth = useOptimizedAuthContext();

  // Override with dev mode if active
  const authState = (() => {
    if (devMode?.isDevMode && devMode.settings.bypassAuth) {
      // Use mock user if available, otherwise create a default dev user
      const mockUser = devMode.currentMockUser || {
        id: 'dev-user-default',
        email: 'dev@ariviavillas.com',
        name: 'Development User',
        role: 'administrator' as UserRole,
        avatar: "/placeholder.svg"
      };
      
      return {
        user: mockUser,
        session: {
          access_token: 'dev-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'dev-refresh',
          user: {
            id: mockUser.id,
            email: mockUser.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            app_metadata: {},
            user_metadata: { name: mockUser.name, role: mockUser.role }
          }
        } as Session,
        isLoading: false,
        isAuthenticated: true,
        error: null,
        refreshAuthState: async () => {},
        circuitBreakerStats: { profile: null, auth: null }
      };
    }
    
    return optimizedAuth;
  })();

  const { user, session, isLoading, error, refreshAuthState } = authState;

  // Auth operations
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await refreshAuthState();
      toastService.success("Signed in", { description: "Welcome back" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      toastService.error("Login failed", { description: message });
      throw err;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "property_manager"
  ): Promise<boolean> => {
    try {
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
      toastService.success("Account created", { description: "Please check your email to complete signup" });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      toastService.error("Signup failed", { description: message });
      return false;
    }
  };

const signOut = async () => {
  try {
    await supabase.auth.signOut({ scope: 'local' });
    toastService.success("Signed out");
  } catch (err) {
    toastService.error("Failed to sign out", { description: err instanceof Error ? err.message : "" });
  } finally {
    window.location.href = "/login";
  }
};

const resetPassword = async (email: string) => {
  try {
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
    if (error) throw error;
    toastService.success("Reset Email Sent", { description: "Check your email for reset instructions." });
  } catch (err) {
    toastService.error("Reset Failed", { description: err instanceof Error ? err.message : "" });
    throw err;
  }
};

const value: AuthContextType = {
  user,
  session,
  isLoading,
  isAuthenticated: !!user && !!session,
  error,
  refreshAuthState: async () => {
    if (refreshAuthState) {
      await refreshAuthState();
    }
  },
  signIn,
  signUp,
  signOut,
  resetPassword
};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
