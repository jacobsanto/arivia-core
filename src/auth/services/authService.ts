/**
 * Authentication service - handles Supabase auth operations
 */
import { supabase } from "@/integrations/supabase/client";
import { Session, User, UserRole } from "../types";
import { logger } from "@/services/logger";

export class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ error: any }> {
    try {
      logger.debug('AuthService', 'Attempting sign in', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('AuthService', 'Sign in failed', { error: error.message });
        return { error };
      }

      logger.debug('AuthService', 'Sign in successful', { userId: data.user?.id });
      return { error: null };
    } catch (error) {
      logger.error('AuthService', 'Sign in error', { error });
      return { error };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, userData?: any): Promise<{ error: any }> {
    try {
      logger.debug('AuthService', 'Attempting sign up', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });

      if (error) {
        logger.error('AuthService', 'Sign up failed', { error: error.message });
        return { error };
      }

      logger.debug('AuthService', 'Sign up successful', { userId: data.user?.id });
      return { error: null };
    } catch (error) {
      logger.error('AuthService', 'Sign up error', { error });
      return { error };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: any }> {
    try {
      logger.debug('AuthService', 'Attempting sign out');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('AuthService', 'Sign out failed', { error: error.message });
        return { error };
      }

      logger.debug('AuthService', 'Sign out successful');
      return { error: null };
    } catch (error) {
      logger.error('AuthService', 'Sign out error', { error });
      return { error };
    }
  }

  /**
   * Reset password via email
   */
  async resetPassword(email: string): Promise<{ error: any }> {
    try {
      logger.debug('AuthService', 'Attempting password reset', { email });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        logger.error('AuthService', 'Password reset failed', { error: error.message });
        return { error };
      }

      logger.debug('AuthService', 'Password reset email sent');
      return { error: null };
    } catch (error) {
      logger.error('AuthService', 'Password reset error', { error });
      return { error };
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('AuthService', 'Error getting session', { error: error.message });
        return null;
      }

      return data.session as Session | null;
    } catch (error) {
      logger.error('AuthService', 'Session error', { error });
      return null;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const session = await this.getCurrentSession();
      if (!session) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        logger.error('AuthService', 'Error getting user profile', { error: error.message });
        return null;
      }

      if (!profile) {
        logger.warn('AuthService', 'No profile found for user', { userId: session.user.id });
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email || '',
        name: profile.name || session.user.email?.split('@')[0] || 'User',
        role: profile.role as UserRole || 'housekeeping_staff',
        avatar: profile.avatar || "/placeholder.svg",
        phone: profile.phone,
        secondaryRoles: undefined, // Not implemented in current schema
        customPermissions: profile.custom_permissions as Record<string, boolean> || {}
      };
    } catch (error) {
      logger.error('AuthService', 'User profile error', { error });
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('AuthService', 'Auth state changed', { event, userId: session?.user?.id });
      
      if (session) {
        const user = await this.getCurrentUser();
        callback(user, session as Session);
      } else {
        callback(null, null);
      }
    });
  }
}

// Export singleton instance
export const authService = new AuthService();