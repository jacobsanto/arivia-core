
// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";

import { logger } from "@/services/logger";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  // Alias for compatibility with older components
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isAuthenticating: boolean;
  refreshAuthState: () => Promise<void>;
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const refreshAuthState = async () => {
    try {
      logger.debug('AuthContext', 'Refreshing auth state');
      

      logger.debug('AuthContext', 'Using real Supabase authentication');
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      setSession(data.session);
      
      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, user_id, name, email, role, avatar, phone')
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
            secondaryRoles: undefined,
            customPermissions: {}
          };
          logger.debug('AuthContext', 'Real user loaded', { name: newUser.name, role: newUser.role });
          setUser(newUser);
        }
      } else {
        logger.debug('AuthContext', 'No session found');
        setUser(null);
      }
    } catch (err) {
      logger.error('AuthContext', 'Error refreshing auth state', { error: err });
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
      async (event, newSession) => {
        logger.debug('AuthContext', 'Auth state change event', { event });
        
        setSession(newSession);
        
        if (newSession?.user) {
          // Fetch profile data synchronously
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, user_id, name, email, role, avatar, phone')
              .eq('id', newSession.user.id)
              .single();

            if (profile) {
              const newUser = {
                id: newSession.user.id,
                email: newSession.user.email || '',
                name: profile.name || newSession.user.email?.split('@')[0] || 'User',
                role: profile.role as UserRole || 'property_manager',
                avatar: profile.avatar || "/placeholder.svg",
                phone: profile.phone,
                secondaryRoles: undefined,
                customPermissions: {}
              };
              setUser(newUser);
            }
          } catch (error) {
            logger.error('AuthContext', 'Error fetching profile', { error });
          }
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



  // Auth actions unified for app
  const signIn = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toastService.error('Sign In Failed', { description: error.message });
        return { error };
      }
      toastService.success('Welcome Back!', { description: 'You have successfully signed in.' });
      return { error: null };
    } catch (err) {
      logger.error('AuthContext', 'Sign in error', { error: err });
      return { error: err };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setIsAuthenticating(true);
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData || {}
        }
      });
      if (error) {
        toastService.error('Sign Up Failed', { description: error.message });
        return { error };
      }
      toastService.success('Account Created!', { description: 'Please check your email to verify your account.' });
      return { error: null };
    } catch (err) {
      logger.error('AuthContext', 'Sign up error', { error: err });
      return { error: err };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signOut = async () => {
    try {
      setIsAuthenticating(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toastService.error('Sign Out Failed', { description: error.message });
        return { error };
      }
      toastService.info('Signed Out', { description: 'You have been successfully signed out.' });
      return { error: null };
    } catch (err) {
      logger.error('AuthContext', 'Sign out error', { error: err });
      return { error: err };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      if (error) {
        toastService.error('Reset Failed', { description: error.message });
        return { error };
      }
      toastService.success('Reset Email Sent', { description: 'Please check your email for password reset instructions.' });
      return { error: null };
    } catch (err) {
      logger.error('AuthContext', 'Password reset error', { error: err });
      return { error: err };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    loading: isLoading,
    isAuthenticated: !!user && !!session,
    error,
    isAuthenticating,
    refreshAuthState,
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
