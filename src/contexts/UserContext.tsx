import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, Session } from "@/types/auth";
import { UserContextType } from "./types/userContext.types";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/services/logger';
import { toastService } from '@/services/toast';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentIsLoading, setCurrentIsLoading] = useState(true);

  // Fetch user profile from authenticated session
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching user profile:', error);
        return null;
      }

      if (!profile) {
        logger.info('No profile found for user:', userId);
        return null;
      }

      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
        avatar: profile.avatar,
        phone: profile.phone,
        secondaryRoles: [],
        customPermissions: (profile.custom_permissions as Record<string, boolean>) || {}
      };

      setCurrentUser(user);
      return user;
    } catch (error) {
      logger.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug('UserContext', 'Auth state change', { event });
        
        setCurrentSession(session);
        
        if (session?.user) {
          // User is authenticated - fetch their profile
          await fetchUserProfile(session.user.id);
        } else {
          // User is not authenticated
          setCurrentUser(null);
        }
        
        setCurrentIsLoading(false);
      }
    );

    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Error getting session:', error);
          setCurrentIsLoading(false);
          return;
        }

        setCurrentSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
        
        setCurrentIsLoading(false);
      } catch (error) {
        logger.error('Error initializing auth:', error);
        setCurrentIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Real authentication using Supabase
  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      setCurrentIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        logger.error('Login error:', error);
        toastService.error('Login failed', { description: error.message });
        throw error;
      }
      
      toastService.success('Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    } finally {
      setCurrentIsLoading(false);
    }
  };

  const handleSignup = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "property_manager"
  ) => {
    try {
      setCurrentIsLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: fullName,
            role: role
          }
        }
      });

      if (error) {
        logger.error('Signup error:', error);
        toastService.error('Signup failed', { description: error.message });
        return false;
      }

      toastService.success('Account created', { 
        description: 'Please check your email to verify your account.' 
      });
      return true;
    } catch (error) {
      logger.error('Signup error:', error);
      return false;
    } finally {
      setCurrentIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      logger.auth("Logging out user");
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear local state
      setCurrentUser(null);
      setCurrentSession(null);
      
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("authToken");
      localStorage.removeItem("lastAuthTime");
      
      // Show success message
      toastService.success("Logged out successfully");
      
      // Redirect to login with full page reload
      window.location.href = "/login";
    } catch (error) {
      logger.error('Logout error:', error);
      toastService.error("Logout failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      
      // Force redirect even on error
      window.location.href = "/login";
    }
  };

  const handleHasPermission = (roles: UserRole[]) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  const handleHasFeatureAccess = (featureKey: string) => {
    if (!currentUser) return false;
    return currentUser.customPermissions[featureKey] ?? true;
  };

  const handleGetOfflineLoginStatus = () => {
    // Offline login not supported with real auth
    return { isOfflineLoggedIn: false, timeRemaining: 0 };
  };

  const handleUpdateUserPermissions = async (userId: string, permissions: Record<string, boolean>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_permissions: permissions })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error updating permissions:', error);
      return false;
    }
  };

  const handleUpdateUserAvatar = async (userId: string, avatarUrl: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar: avatarUrl })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error updating avatar:', error);
      return false;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      return false;
    }
  };

  const handleSyncUserProfile = async () => {
    if (!currentSession?.user) {
      logger.info('No authenticated user to sync');
      return false;
    }
    
    const profile = await fetchUserProfile(currentSession.user.id);
    return !!profile;
  };

  const handleUpdateProfile = async (
    userId: string,
    profileData: Partial<{
      name: string;
      email: string;
      role: UserRole;
      secondaryRoles?: UserRole[];
      customPermissions?: Record<string, boolean>;
      phone?: string;
    }>
  ) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          custom_permissions: profileData.customPermissions,
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Refresh user if updating current user
      if (userId === currentUser?.id) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (updatedProfile) {
          setCurrentUser({
            id: updatedProfile.id,
            email: updatedProfile.email,
            name: updatedProfile.name,
            role: updatedProfile.role as UserRole,
            avatar: updatedProfile.avatar,
            phone: updatedProfile.phone,
            secondaryRoles: [],
            customPermissions: (updatedProfile.custom_permissions as Record<string, boolean>) || {}
          });
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error updating profile:', error);
      return false;
    }
  };

  const handleRefreshProfile = async () => {
    if (!currentSession?.user) {
      logger.info('No authenticated user to refresh');
      return false;
    }
    
    const profile = await fetchUserProfile(currentSession.user.id);
    return !!profile;
  };

  return (
    <UserContext.Provider
      value={{
        user: currentUser,
        session: currentSession,
        isLoading: currentIsLoading,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        hasPermission: handleHasPermission,
        hasFeatureAccess: handleHasFeatureAccess,
        getOfflineLoginStatus: handleGetOfflineLoginStatus,
        updateUserPermissions: handleUpdateUserPermissions,
        updateUserAvatar: handleUpdateUserAvatar,
        deleteUser: handleDeleteUser,
        syncUserProfile: handleSyncUserProfile,
        updateProfile: handleUpdateProfile,
        refreshProfile: handleRefreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
