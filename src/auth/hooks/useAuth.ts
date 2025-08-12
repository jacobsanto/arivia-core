/**
 * Authentication hook - handles auth operations
 */
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    // Auth state
    user: context.user,
    session: context.session,
    isLoading: context.isLoading,
    isAuthenticated: context.isAuthenticated,
    error: context.error,
    
    // Auth operations
    signIn: context.signIn,
    signUp: context.signUp,
    signOut: context.signOut,
    resetPassword: context.resetPassword,
    refreshAuthState: context.refreshAuthState,
    
    // Legacy compatibility aliases
    login: context.login,
    signup: context.signup,
    logout: context.logout,
    loading: context.loading,
  };
};