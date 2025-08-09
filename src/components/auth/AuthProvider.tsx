import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast/toast.service';
import { logger } from '@/services/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          // Create or update profile when user signs in
          setTimeout(() => {
            ensureUserProfile(session.user);
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            role: 'concierge', // Default role
            avatar: user.user_metadata?.avatar_url || null,
            phone: user.user_metadata?.phone || null
          });

        if (insertError) {
          logger.error('Error creating profile', insertError);
        }
      }
    } catch (error) {
      logger.error('Error ensuring user profile', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toastService.error('Sign In Failed', {
          description: error.message
        });
        return { error };
      }

      toastService.success('Welcome Back!', {
        description: 'You have successfully signed in.'
      });

      return { error: null };
    } catch (error) {
      logger.error('Sign in error', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData || {}
        }
      });

      if (error) {
        toastService.error('Sign Up Failed', {
          description: error.message
        });
        return { error };
      }

      toastService.success('Account Created!', {
        description: 'Please check your email to verify your account.'
      });

      return { error: null };
    } catch (error) {
      logger.error('Sign up error', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        toastService.error('Sign Out Failed', {
          description: error.message
        });
        return { error };
      }

      toastService.info('Signed Out', {
        description: 'You have been successfully signed out.'
      });

      return { error: null };
    } catch (error) {
      logger.error('Sign out error', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toastService.error('Reset Failed', {
          description: error.message
        });
        return { error };
      }

      toastService.success('Reset Email Sent', {
        description: 'Please check your email for password reset instructions.'
      });

      return { error: null };
    } catch (error) {
      logger.error('Password reset error', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};