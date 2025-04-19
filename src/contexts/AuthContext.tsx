
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";

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

  const refreshAuthState = async () => {
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (data.session) {
        setSession(data.session);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profile) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: profile.name || data.session.user.email?.split('@')[0] || 'User',
            role: profile.role || 'property_manager',
            avatar: profile.avatar || "/placeholder.svg",
            phone: profile.phone,
            secondaryRoles: profile.secondary_roles,
            customPermissions: profile.custom_permissions
          });
        }
      }
    } catch (err) {
      console.error("Error refreshing auth state:", err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication error';
      setError(errorMessage);
      toastService.error("Authentication error", {
        description: "There was a problem refreshing your session"
      });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state change event:", event);
        setSession(newSession);
        
        if (newSession?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();

          if (profile) {
            setUser({
              id: newSession.user.id,
              email: newSession.user.email || '',
              name: profile.name || newSession.user.email?.split('@')[0] || 'User',
              role: profile.role || 'property_manager',
              avatar: profile.avatar || "/placeholder.svg",
              phone: profile.phone,
              secondaryRoles: profile.secondary_roles,
              customPermissions: profile.custom_permissions
            });
          }
        } else {
          setUser(null);
        }
      }
    );

    refreshAuthState();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
