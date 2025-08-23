/**
 * Unified Authentication Provider - Single source of truth for auth state
 * Replaces both AuthContext and UserContext with a cleaner, more maintainable architecture
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, UserRole, AuthContextType } from '../types';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { permissionService } from '../services/permissionService';
import { useDevMode } from '@/contexts/DevModeContext';
import { toastService } from '@/services/toast';
import { logger } from '@/services/logger';
import { monitorAuthAttempt, logUserActivity } from '@/services/security/securityMonitoring';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Core auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dev mode integration (safe access)
  const devMode = (() => {
    try {
      return useDevMode();
    } catch {
      return null;
    }
  })();

  // Computed state
  const isAuthenticated = Boolean(user && session);

  /**
   * Refresh authentication state from Supabase or dev mode
   */
  const refreshAuthState = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('AuthProvider', 'Refreshing auth state');

      // Security: Enhanced dev mode protection
      const isLocalDev = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.endsWith('.local')) &&
        (!window.location.protocol.includes('https') || window.location.hostname === 'localhost');
      
      const isDevelopmentEnv = process.env.NODE_ENV === 'development' || 
        import.meta.env.DEV === true;
         
      // Security: Only allow dev mode bypass in strict local development
      if (devMode?.isDevMode && devMode.settings.bypassAuth && isLocalDev && isDevelopmentEnv) {
        logger.debug('AuthProvider', 'Using dev mode authentication bypass');
        
        const mockUser = devMode.currentMockUser || {
          id: 'dev-user-default',
          email: 'dev@ariviavillas.com',
          name: 'Development User',
          role: 'administrator' as UserRole,
          avatar: "/placeholder.svg"
        };

        setUser(mockUser);
        setSession({
          access_token: `dev-token-${Date.now()}`, // Dynamic token to prevent hardcoding
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: `dev-refresh-${Date.now()}`,
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

        logger.debug('AuthProvider', 'Dev mode user set', { name: mockUser.name, role: mockUser.role });
        return;
      }

      // Use real Supabase authentication
      logger.debug('AuthProvider', 'Using Supabase authentication');
      
      const currentSession = await authService.getCurrentSession();
      setSession(currentSession);

      if (currentSession) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        logger.debug('AuthProvider', 'User authenticated', { 
          userId: currentUser?.id, 
          role: currentUser?.role 
        });
      } else {
        setUser(null);
        logger.debug('AuthProvider', 'No active session');
      }
    } catch (err: any) {
      logger.error('AuthProvider', 'Error refreshing auth state', { error: err.message });
      setError(err.message || 'Authentication error');
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state and listen to changes
  useEffect(() => {
    refreshAuthState();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user, session) => {
      logger.debug('AuthProvider', 'Auth state change detected', { 
        userId: user?.id, 
        hasSession: Boolean(session) 
      });
      setUser(user);
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen to dev mode changes
  useEffect(() => {
    if (!devMode) return;

    const handleMockUserChange = () => {
      logger.debug('AuthProvider', 'Mock user changed, refreshing auth state');
      refreshAuthState();
    };

    window.addEventListener('mockUserChanged', handleMockUserChange);
    window.addEventListener('mockUserStateUpdate', handleMockUserChange);

    return () => {
      window.removeEventListener('mockUserChanged', handleMockUserChange);
      window.removeEventListener('mockUserStateUpdate', handleMockUserChange);
    };
  }, [devMode]);

  // ====== AUTH OPERATIONS ======

  const signIn = async (email: string, password: string): Promise<{ error: any }> => {
    try {
      setError(null);
      logger.debug('AuthProvider', 'Starting sign in', { email });
      
      const result = await authService.signIn(email, password);
      
      // Monitor authentication attempt
      await monitorAuthAttempt(email, !result.error);
      
      if (result.error) {
        setError(result.error.message);
        toastService.error('Sign in failed', result.error.message);
      } else {
        toastService.success('Signed in successfully');
        await logUserActivity('sign_in', 'authentication');
      }
      
      return result;
    } catch (error: any) {
      logger.error('AuthProvider', 'Sign in error', { error });
      setError(error.message);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any): Promise<{ error: any }> => {
    try {
      setError(null);
      logger.debug('AuthProvider', 'Starting sign up', { email });
      
      const result = await authService.signUp(email, password, userData);
      
      if (result.error) {
        setError(result.error.message);
        toastService.error('Sign up failed', result.error.message);
      } else {
        toastService.success('Account created successfully');
      }
      
      return result;
    } catch (error: any) {
      logger.error('AuthProvider', 'Sign up error', { error });
      setError(error.message);
      return { error };
    }
  };

  const signOut = async (): Promise<{ error: any }> => {
    try {
      setError(null);
      logger.debug('AuthProvider', 'Starting sign out');
      
      const result = await authService.signOut();
      
      if (result.error) {
        setError(result.error.message);
        toastService.error('Sign out failed', result.error.message);
      } else {
        await logUserActivity('sign_out', 'authentication');
        setUser(null);
        setSession(null);
        toastService.success('Signed out successfully');
      }
      
      return result;
    } catch (error: any) {
      logger.error('AuthProvider', 'Sign out error', { error });
      setError(error.message);
      return { error };
    }
  };

  const resetPassword = async (email: string): Promise<{ error: any }> => {
    try {
      setError(null);
      logger.debug('AuthProvider', 'Starting password reset', { email });
      
      const result = await authService.resetPassword(email);
      
      if (result.error) {
        setError(result.error.message);
        toastService.error('Password reset failed', result.error.message);
      } else {
        toastService.success('Password reset email sent');
      }
      
      return result;
    } catch (error: any) {
      logger.error('AuthProvider', 'Password reset error', { error });
      setError(error.message);
      return { error };
    }
  };

  // ====== PROFILE OPERATIONS ======

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      logger.debug('AuthProvider', 'Updating profile', { userId: user.id });
      
      await profileService.updateProfile(user.id, updates);
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      toastService.success('Profile updated successfully');
    } catch (error: any) {
      logger.error('AuthProvider', 'Profile update error', { error });
      toastService.error('Failed to update profile', error.message);
      throw error;
    }
  };

  const updateUserAvatar = async (avatarUrl: string): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      logger.debug('AuthProvider', 'Updating avatar', { userId: user.id });
      
      await profileService.updateAvatar(user.id, avatarUrl);
      
      // Update local state
      setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      
      toastService.success('Avatar updated successfully');
    } catch (error: any) {
      logger.error('AuthProvider', 'Avatar update error', { error });
      toastService.error('Failed to update avatar', error.message);
      throw error;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      logger.debug('AuthProvider', 'Refreshing profile', { userId: user.id });
      
      const updatedProfile = await profileService.getProfile(user.id);
      if (updatedProfile) {
        setUser(updatedProfile);
      }
    } catch (error: any) {
      logger.error('AuthProvider', 'Profile refresh error', { error });
    }
  };

  const deleteUserProfile = async (userId: string): Promise<void> => {
    try {
      logger.debug('AuthProvider', 'Deleting user profile', { userId });
      
      await profileService.deleteProfile(userId);
      
      // If deleting own profile, sign out
      if (user && user.id === userId) {
        await signOut();
      }
      
      toastService.success('User profile deleted');
    } catch (error: any) {
      logger.error('AuthProvider', 'Profile deletion error', { error });
      toastService.error('Failed to delete profile', error.message);
      throw error;
    }
  };

  // ====== PERMISSION OPERATIONS ======

  const checkFeatureAccess = (featureKey: string): boolean => {
    return permissionService.checkFeatureAccess(user, featureKey);
  };

  const checkRolePermission = (roles: UserRole[]): boolean => {
    return permissionService.checkRolePermission(user, roles);
  };

  const updateUserPermissions = async (userId: string, permissions: Record<string, boolean>): Promise<void> => {
    try {
      logger.debug('AuthProvider', 'Updating user permissions', { userId });
      
      await profileService.updatePermissions(userId, permissions);
      
      // If updating own permissions, refresh profile
      if (user && user.id === userId) {
        await refreshProfile();
      }
      
      toastService.success('Permissions updated successfully');
    } catch (error: any) {
      logger.error('AuthProvider', 'Permission update error', { error });
      toastService.error('Failed to update permissions', error.message);
      throw error;
    }
  };

  const getOfflineLoginStatus = (): boolean => {
    return permissionService.getOfflineLoginStatus();
  };

  // ====== LEGACY COMPATIBILITY ======

  const login = async (email: string, password: string): Promise<void> => {
    const result = await signIn(email, password);
    if (result.error) {
      throw new Error(result.error.message);
    }
  };

  const signup = async (email: string, password: string, userData?: any): Promise<void> => {
    const result = await signUp(email, password, userData);
    if (result.error) {
      throw new Error(result.error.message);
    }
  };

  const logout = async (): Promise<void> => {
    const result = await signOut();
    if (result.error) {
      throw new Error(result.error.message);
    }
  };

  // ====== CONTEXT VALUE ======

  const contextValue: AuthContextType = {
    // State
    user,
    session,
    isLoading,
    isAuthenticated,
    error,

    // Auth operations
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshAuthState,

    // Profile operations
    updateProfile,
    updateUserAvatar,
    refreshProfile,
    deleteUserProfile,

    // Permission operations
    checkFeatureAccess,
    checkRolePermission,
    updateUserPermissions,
    getOfflineLoginStatus,

    // Legacy compatibility
    login,
    signup,
    logout,
    loading: isLoading, // alias
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};