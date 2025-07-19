
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";
import { useDevMode } from "@/contexts/DevModeContext";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const refreshAuthState = async () => {
    try {
      // Check if dev mode is active and should bypass auth
      if (devMode?.isDevMode && devMode.settings.bypassAuth) {
        // Use mock user if available, otherwise create a default dev user
        const mockUser = devMode.currentMockUser || {
          id: 'dev-user-default',
          email: 'dev@ariviavillas.com',
          name: 'Development User',
          role: 'administrator' as UserRole,
          avatar: "/placeholder.svg"
        };
        
        setUser(mockUser);
        setSession({
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
        } as Session);
        
        setIsLoading(false);
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      setSession(data.session);
      
      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profile) {
          const newUser = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: profile.name || data.session.user.email?.split('@')[0] || 'User',
            role: profile.role as UserRole || 'property_manager',
            avatar: profile.avatar || "/placeholder.svg",
            phone: profile.phone,
            secondaryRoles: profile.secondary_roles ? profile.secondary_roles.map(role => role as UserRole) : undefined,
            customPermissions: profile.custom_permissions as Record<string, boolean> || {}
          };
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error refreshing auth state:", err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication error';
      setError(errorMessage);
      toastService.error("Authentication error", {
        description: "There was a problem refreshing your session"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state change event:", event);
        
        // If dev mode is active and bypassing auth, ignore auth state changes
        if (devMode?.isDevMode && devMode.settings.bypassAuth) {
          return;
        }
        
        setSession(newSession);
        
        if (newSession?.user) {
          // Use setTimeout to prevent auth deadlock
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single()
              .then(({ data: profile }) => {
                if (profile) {
                  const newUser = {
                    id: newSession.user.id,
                    email: newSession.user.email || '',
                    name: profile.name || newSession.user.email?.split('@')[0] || 'User',
                    role: profile.role as UserRole || 'property_manager',
                    avatar: profile.avatar || "/placeholder.svg",
                    phone: profile.phone,
                    secondaryRoles: profile.secondary_roles ? profile.secondary_roles.map(role => role as UserRole) : undefined,
                    customPermissions: profile.custom_permissions as Record<string, boolean> || {}
                  };
                  setUser(newUser);
                }
              });
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Initialize auth state
    refreshAuthState();

    return () => {
      subscription.unsubscribe();
    };
  }, [devMode?.isDevMode, devMode?.settings.bypassAuth, devMode?.currentMockUser]);

  // Update user when mock user changes in dev mode
  useEffect(() => {
    if (devMode?.isDevMode && devMode.settings.bypassAuth && devMode.currentMockUser) {
      setUser(devMode.currentMockUser);
    }
  }, [devMode?.currentMockUser, devMode?.isDevMode, devMode?.settings.bypassAuth]);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    error,
    refreshAuthState
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
