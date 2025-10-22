
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
  const [error, setError] = useState<string | null>(null);
  const lastRefreshRef = React.useRef<number>(0);
  const REFRESH_COOLDOWN = 60000; // 1 minute cooldown between refreshes

  

  // Helper function to create profile for user without one
  const createProfileForUser = async (user: any): Promise<boolean> => {
    try {
      logger.debug('AuthContext', 'Creating profile for user', { userId: user.id });
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: (user.user_metadata?.role as UserRole) || 'housekeeping_staff'
        })
        .select()
        .single();
      
      if (error) {
        logger.error('AuthContext', 'Failed to create profile', { error });
        return false;
      }
      
      logger.debug('AuthContext', 'Profile created successfully', { profile: data });
      return true;
    } catch (err) {
      logger.error('AuthContext', 'Error in createProfileForUser', { error: err });
      return false;
    }
  };

  const refreshAuthState = async () => {
    // Rate limiting check
    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_COOLDOWN) {
      logger.debug('AuthContext', 'Auth refresh skipped due to cooldown', { 
        timeSinceLastRefresh: now - lastRefreshRef.current 
      });
      return;
    }
    lastRefreshRef.current = now;
    
    try {
      logger.debug('AuthContext', 'Refreshing auth state');
      

      logger.debug('AuthContext', 'Using real Supabase authentication');
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      setSession(data.session);
      
      if (data.session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();
        
        if (profileError) {
          logger.error('AuthContext', 'Profile fetch error', { error: profileError });
          // If profile doesn't exist, try to create one
          if (profileError.code === 'PGRST116') {
            logger.debug('AuthContext', 'Profile not found, creating new profile');
            const created = await createProfileForUser(data.session.user);
            if (created) {
              // Retry fetching the profile
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', data.session.user.id)
                .single();
              
              if (newProfile) {
                const newUser = {
                  id: data.session.user.id,
                  email: data.session.user.email || '',
                  name: newProfile.name || data.session.user.email?.split('@')[0] || 'User',
                  role: newProfile.role as UserRole || 'property_manager',
                  avatar: newProfile.avatar || "/placeholder.svg",
                  phone: newProfile.phone,
                  secondaryRoles: newProfile.secondary_roles ? newProfile.secondary_roles.map(role => role as UserRole) : undefined,
                  customPermissions: newProfile.custom_permissions as Record<string, boolean> || {}
                };
                setUser(newUser);
                return;
              }
            }
          }
        }

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
      (event, newSession) => {
        logger.debug('AuthContext', 'Auth state change event', { event });
        
        
        setSession(newSession);
        
        if (newSession?.user) {
          // Use setTimeout to prevent auth deadlock
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('*')
              .eq('user_id', newSession.user.id)
              .single()
              .then(({ data: profile, error: profileError }) => {
                if (profileError) {
                  logger.error('AuthContext', 'Profile load error in auth listener', { error: profileError });
                  return;
                }
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
  }, []);



  // Auth actions unified for app
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
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
