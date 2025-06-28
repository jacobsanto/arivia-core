import React, { createContext, useContext, useState, useEffect } from "react";
import { User, safeRoleCast } from "@/types/auth/base";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";
import { isAuthorizedRole } from "@/lib/utils/routing";
import type { Session as SupabaseSession } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: SupabaseSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuthState = async () => {
    try {
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
          const userRole = safeRoleCast(profile.role);
          const newUser = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: profile.name || data.session.user.email?.split('@')[0] || 'User',
            role: userRole,
            avatar: profile.avatar || "/placeholder.svg",
            phone: profile.phone,
            secondaryRoles: profile.secondary_roles ? profile.secondary_roles.map((role: string) => safeRoleCast(role)) : undefined,
            customPermissions: profile.custom_permissions as Record<string, boolean> || {}
          };

          // Check if user has authorized role for internal access
          if (!isAuthorizedRole(userRole)) {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setError("Access denied: Unauthorized role");
            return;
          }

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
                  const userRole = safeRoleCast(profile.role);
                  const newUser = {
                    id: newSession.user.id,
                    email: newSession.user.email || '',
                    name: profile.name || newSession.user.email?.split('@')[0] || 'User',
                    role: userRole,
                    avatar: profile.avatar || "/placeholder.svg",
                    phone: profile.phone,
                    secondaryRoles: profile.secondary_roles ? profile.secondary_roles.map((role: string) => safeRoleCast(role)) : undefined,
                    customPermissions: profile.custom_permissions as Record<string, boolean> || {}
                  };

                  // Check if user has authorized role for internal access
                  if (!isAuthorizedRole(userRole)) {
                    supabase.auth.signOut();
                    setUser(null);
                    setError("Access denied: Unauthorized role");
                    return;
                  }

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
  }, []);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session && user.role !== undefined && isAuthorizedRole(safeRoleCast(user.role)),
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
