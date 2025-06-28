
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { UserProfile, safeRoleCast } from '@/types/auth/base';
import { getRoleBasedRoute } from '@/lib/utils/routing';
import { useNavigate } from 'react-router-dom';

interface UserContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  canAccess: (permission: string) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  deleteAllUsers: () => Promise<void>;
  fetchUsers: () => Promise<UserProfile[]>;
  // Alias methods for compatibility
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
  // Additional methods
  refreshProfile: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateUserPermissions: (userId: string, permissions: Record<string, boolean>) => Promise<void>;
  getOfflineLoginStatus: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

// Helper function to safely convert Json to Record<string, boolean>
const safeConvertCustomPermissions = (customPermissions: any): Record<string, boolean> => {
  if (!customPermissions) return {};
  if (typeof customPermissions === 'object' && customPermissions !== null) {
    return customPermissions as Record<string, boolean>;
  }
  if (typeof customPermissions === 'string') {
    try {
      return JSON.parse(customPermissions);
    } catch {
      return {};
    }
  }
  return {};
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { canAccess: permissionCanAccess } = usePermissions();

  // Extract user role from current user
  const userRole = user?.role || null;
  const isAuthenticated = !!session?.user;
  const isLoading = loading;

  // Permission check function using the user's role
  const canAccess = (permission: string) => {
    return permissionCanAccess(permission, userRole);
  };

  const refreshProfile = async () => {
    if (!session?.user) {
      console.log('No session user found for profile refresh');
      return;
    }
    
    try {
      console.log('Refreshing profile for user:', session.user.id);
      await fetchProfileForSession(session);
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  const fetchProfileForSession = async (sessionData: Session) => {
    if (!sessionData?.user) {
      console.log('No user in session data');
      return;
    }

    try {
      console.log('Fetching profile for user:', sessionData.user.id);
      
      // Use maybeSingle() to avoid errors when profile doesn't exist
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // Create a basic user profile from session data if query fails
        const basicUserProfile: UserProfile = {
          id: sessionData.user.id,
          name: sessionData.user.email?.split('@')[0] || 'User',
          email: sessionData.user.email || '',
          role: 'property_manager',
          secondary_roles: [],
          custom_permissions: {}
        };
        
        console.log('Using basic profile due to error:', basicUserProfile);
        setUser(basicUserProfile);
        return;
      }
      
      if (profile) {
        const userProfile: UserProfile = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          phone: profile.phone,
          avatar: profile.avatar,
          secondary_roles: profile.secondary_roles || [],
          custom_permissions: safeConvertCustomPermissions(profile.custom_permissions)
        };
        
        console.log('Profile fetched successfully:', userProfile);
        setUser(userProfile);
      } else {
        // No profile found, create one using Supabase auth user data
        console.log('No profile found, creating basic profile from session');
        const fallbackProfile: UserProfile = {
          id: sessionData.user.id,
          name: sessionData.user.user_metadata?.name || sessionData.user.email?.split('@')[0] || 'User',
          email: sessionData.user.email || '',
          role: 'property_manager',
          secondary_roles: [],
          custom_permissions: {}
        };
        
        console.log('Using fallback profile:', fallbackProfile);
        setUser(fallbackProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfileForSession:', error);
      
      // Fallback: create basic profile from session
      if (sessionData.user) {
        const fallbackProfile: UserProfile = {
          id: sessionData.user.id,
          name: sessionData.user.email?.split('@')[0] || 'User',
          email: sessionData.user.email || '',
          role: 'property_manager',
          secondary_roles: [],
          custom_permissions: {}
        };
        
        console.log('Using fallback profile due to exception:', fallbackProfile);
        setUser(fallbackProfile);
      }
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        try {
          setSession(session);
          
          if (session?.user) {
            console.log('User session found, fetching profile');
            await fetchProfileForSession(session);
          } else {
            console.log('No user session, clearing user state');
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        } finally {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session');
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (existingSession) {
          console.log('Existing session found:', existingSession.user.id);
          setSession(existingSession);
          await fetchProfileForSession(existingSession);
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
      } finally {
        console.log('Initial session check complete, setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Error signing out:', error);
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Redirect to login
      window.location.href = '/internal/login';
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }
      
      setUser({ ...user, ...updates });
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    await updateProfile({ avatar: avatarUrl });
  };

  const updateUserPermissions = async (userId: string, permissions: Record<string, boolean>) => {
    const { error } = await supabase
      .from('profiles')
      .update({ custom_permissions: permissions })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  };

  const deleteAllUsers = async () => {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', user?.id);
      
      if (users) {
        for (const userToDelete of users) {
          await deleteUser(userToDelete.id);
        }
      }
    } catch (error) {
      console.error('Error deleting all users:', error);
    }
  };

  const fetchUsers = async (): Promise<UserProfile[]> => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      phone: profile.phone,
      avatar: profile.avatar,
      secondary_roles: profile.secondary_roles || [],
      custom_permissions: safeConvertCustomPermissions(profile.custom_permissions)
    }));
  };

  const getOfflineLoginStatus = () => {
    return !!localStorage.getItem('user');
  };

  const value: UserContextType = {
    user,
    session,
    loading,
    isLoading,
    isAuthenticated,
    userRole,
    canAccess,
    signIn,
    signUp,
    signOut,
    updateProfile,
    deleteUser,
    deleteAllUsers,
    fetchUsers,
    login: signIn,
    logout: signOut,
    signup: signUp,
    refreshProfile,
    updateAvatar,
    updateUserPermissions,
    getOfflineLoginStatus
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
