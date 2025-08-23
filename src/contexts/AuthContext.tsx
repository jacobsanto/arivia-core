
// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";
import { useDevMode } from "@/contexts/DevModeContext";
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

  const devMode = useDevMode();

  const refreshAuthState = async () => {
    try {
      logger.debug('AuthContext', 'Refreshing auth state');
      
      // Check if dev mode is active and should bypass auth
      if (devMode?.isDevMode && devMode.settings.bypassAuth) {
        logger.debug('AuthContext', 'Dev mode active, using mock authentication');
        
        // Use mock user if available, otherwise create a default dev user
        const mockUser = devMode.currentMockUser || {
          id: 'dev-user-default',
          email: 'dev@ariviavillas.com',
          name: 'Development User',
          role: 'administrator' as UserRole,
          avatar: "/placeholder.svg"
        };
        
        logger.debug('AuthContext', 'Setting mock user', { name: mockUser.name, role: mockUser.role });
        
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

      logger.debug('AuthContext', 'Using real Supabase authentication');
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
        
        // If dev mode is active and bypassing auth, ignore auth state changes
        if (devMode?.isDevMode && devMode.settings.bypassAuth) {
          logger.debug('AuthContext', 'Ignoring auth state change due to dev mode');
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
      logger.debug('AuthContext', 'Mock user changed, updating auth state', { name: devMode.currentMockUser.name, role: devMode.currentMockUser.role });
      setUser(devMode.currentMockUser);
      
      // Create a mock session for the new user
      setSession({
        access_token: 'dev-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'dev-refresh',
        user: {
          id: devMode.currentMockUser.id,
          email: devMode.currentMockUser.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aud: 'authenticated',
          app_metadata: {},
          user_metadata: { name: devMode.currentMockUser.name, role: devMode.currentMockUser.role }
        }
      } as Session);
    }
  }, [devMode?.currentMockUser, devMode?.isDevMode, devMode?.settings.bypassAuth]);

  // Listen for mock user changes from other components
  useEffect(() => {
    const handleMockUserChange = (event: CustomEvent) => {
      const mockUser = event.detail;
      logger.debug('AuthContext', 'Mock user change event received', { mockUser });
      
      if (devMode?.isDevMode && devMode.settings.bypassAuth) {
        if (mockUser) {
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
        } else {
          setUser(null);
          setSession(null);
        }
      }
    };

    window.addEventListener('mockUserChanged', handleMockUserChange as EventListener);
    return () => {
      window.removeEventListener('mockUserChanged', handleMockUserChange as EventListener);
    };
  }, [devMode?.isDevMode, devMode?.settings.bypassAuth]);

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
