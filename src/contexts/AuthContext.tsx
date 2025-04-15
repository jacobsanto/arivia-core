
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ? {
          id: newSession.user.id,
          email: newSession.user.email || '',
          name: newSession.user.user_metadata?.name || newSession.user.email?.split('@')[0] || 'User',
          role: newSession.user.user_metadata?.role || 'property_manager',
          avatar: newSession.user.user_metadata?.avatar || "/placeholder.svg"
        } : null);
      }
    );

    // THEN check for existing session
    const initializeSession = async () => {
      try {
        setError(null);
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (data.session) {
          setSession(data.session);
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
            role: data.session.user.user_metadata?.role || 'property_manager',
            avatar: data.session.user.user_metadata?.avatar || "/placeholder.svg"
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication error';
        setError(errorMessage);
        toastService.error("Authentication error", {
          description: "There was a problem with your authentication session"
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    error
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
