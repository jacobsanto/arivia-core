
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state change detected:", event, Boolean(newSession));
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
        console.log("Initializing auth session...");
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("Existing session found");
          setSession(data.session);
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
            role: data.session.user.user_metadata?.role || 'property_manager',
            avatar: data.session.user.user_metadata?.avatar || "/placeholder.svg"
          });
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
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
    isAuthenticated: !!user && !!session
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
