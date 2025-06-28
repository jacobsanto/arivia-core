
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session, UserRole } from "@/types/auth";
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
      setIsLoading(true);
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      setSession(data.session);
      
      if (data.session?.user) {
        // Use setTimeout to prevent auth deadlock
        setTimeout(async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
              // If profile doesn't exist, create a basic user object
              const newUser = {
                id: data.session.user.id,
                email: data.session.user.email || '',
                name: data.session.user.email?.split('@')[0] || 'User',
                role: 'property_manager' as UserRole,
                avatar: "/placeholder.svg"
              };
              setUser(newUser);
            } else if (profile) {
              const newUser = {
                id: data.session.user.id,
                email: data.session.user.email || profile.email || '',
                name: profile.name || data.session.user.email?.split('@')[0] || 'User',
                role: profile.role as UserRole || 'property_manager',
                avatar: profile.avatar || "/placeholder.svg",
                phone: profile.phone,
                secondaryRoles: profile.secondary_roles ? profile.secondary_roles.map(role => role as UserRole) : undefined,
                customPermissions: profile.custom_permissions as Record<string, boolean> || {}
              };
              setUser(newUser);
            }
          } catch (profileError) {
            console.error("Profile fetch error:", profileError);
            // Create basic user from session data
            const newUser = {
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: data.session.user.email?.split('@')[0] || 'User',
              role: 'property_manager' as UserRole,
              avatar: "/placeholder.svg"
            };
            setUser(newUser);
          }
        }, 100);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error refreshing auth state:", err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication error';
      setError(errorMessage);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state change event:", event);
        setSession(newSession);
        
        if (newSession?.user) {
          // Use setTimeout to prevent auth deadlock
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newSession.user.id)
                .single();
                
              if (profile) {
                const newUser = {
                  id: newSession.user.id,
                  email: newSession.user.email || profile.email || '',
                  name: profile.name || newSession.user.email?.split('@')[0] || 'User',
                  role: profile.role as UserRole || 'property_manager',
                  avatar: profile.avatar || "/placeholder.svg",
                  phone: profile.phone,
                  secondaryRoles: profile.secondary_roles ? profile.secondary_roles.map(role => role as UserRole) : undefined,
                  customPermissions: profile.custom_permissions as Record<string, boolean> || {}
                };
                setUser(newUser);
              } else {
                // Create basic user from session data
                const newUser = {
                  id: newSession.user.id,
                  email: newSession.user.email || '',
                  name: newSession.user.email?.split('@')[0] || 'User',
                  role: 'property_manager' as UserRole,
                  avatar: "/placeholder.svg"
                };
                setUser(newUser);
              }
            } catch (error) {
              console.error("Profile fetch error in auth state change:", error);
              // Create basic user from session data
              const newUser = {
                id: newSession.user.id,
                email: newSession.user.email || '',
                name: newSession.user.email?.split('@')[0] || 'User',
                role: 'property_manager' as UserRole,
                avatar: "/placeholder.svg"
              };
              setUser(newUser);
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        if (event === 'SIGNED_IN') {
          setError(null);
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
