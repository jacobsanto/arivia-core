/**
 * Secure Authentication Service - Production-ready implementation
 * Replaces hardcoded credentials with proper Supabase auth
 */
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';
import { logger } from '@/services/logger';
import { monitorAuthAttempt } from '@/services/security/securityMonitoring';

/**
 * Sign in with email and password using Supabase Auth
 */
export const signInSecure = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Monitor authentication attempt
    await monitorAuthAttempt(email, !error);

    if (error) {
      logger.warn('SecureAuth', 'Failed login attempt', { email, error: error.message });
      return { error };
    }

    logger.info('SecureAuth', 'Successful login', { email, userId: data.user?.id });
    return { data, error: null };
  } catch (error: any) {
    logger.error('SecureAuth', 'Login error', { error: error.message });
    await monitorAuthAttempt(email, false);
    return { error };
  }
};

/**
 * Sign up with email and password
 */
export const signUpSecure = async (email: string, password: string, userData?: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    });

    if (error) {
      logger.warn('SecureAuth', 'Failed signup attempt', { email, error: error.message });
      return { error };
    }

    logger.info('SecureAuth', 'Successful signup', { email, userId: data.user?.id });
    return { data, error: null };
  } catch (error: any) {
    logger.error('SecureAuth', 'Signup error', { error: error.message });
    return { error };
  }
};

/**
 * Sign out current user
 */
export const signOutSecure = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error('SecureAuth', 'Signout error', { error: error.message });
      return { error };
    }

    logger.info('SecureAuth', 'User signed out');
    return { error: null };
  } catch (error: any) {
    logger.error('SecureAuth', 'Signout error', { error: error.message });
    return { error };
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.error('SecureAuth', 'Session fetch error', { error: error.message });
      return null;
    }

    return session;
  } catch (error: any) {
    logger.error('SecureAuth', 'Session fetch error', { error: error.message });
    return null;
  }
};

/**
 * Get current user with profile data
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Get profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      logger.error('SecureAuth', 'Profile fetch error', { error: error.message });
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      name: profile?.name || user.email || '',
      role: profile?.role as UserRole || 'housekeeping_staff',
      avatar: profile?.avatar || '/placeholder.svg',
      phone: profile?.phone,
      customPermissions: (profile?.custom_permissions as Record<string, boolean>) || {}
    };
  } catch (error: any) {
    logger.error('SecureAuth', 'User fetch error', { error: error.message });
    return null;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null, session: any) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    logger.debug('SecureAuth', 'Auth state changed', { event, userId: session?.user?.id });
    
    const user = session ? await getCurrentUser() : null;
    callback(user, session);
  });
};

/**
 * Reset password
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      logger.error('SecureAuth', 'Password reset error', { error: error.message });
      return { error };
    }

    logger.info('SecureAuth', 'Password reset sent', { email });
    return { error: null };
  } catch (error: any) {
    logger.error('SecureAuth', 'Password reset error', { error: error.message });
    return { error };
  }
};