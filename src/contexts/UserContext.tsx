
import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, safeRoleCast, profileToUser } from "@/types/auth/base";
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast";
import { isAuthorizedRole } from "@/lib/utils/routing";
import { usePermissions } from "@/hooks/usePermissions";
import type { Session as SupabaseSession } from "@supabase/supabase-js";

interface UserContextType {
  user: UserProfile | null;
  session: SupabaseSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  userRole: string | null;
  canAccess: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<boolean>;
  deleteAllUsers: () => Promise<void>;
  fetchUsers: () => Promise<UserProfile[]>;
  updateUserPermissions: (userId: string, permissions: Record<string, boolean>) => Promise<void>;
  getOfflineLoginStatus: () => boolean;
  // Aliases for backward compatibility
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canAccess: permissionCanAccess } = usePermissions();

  // Extract user role from current user
  const userRole = user?.role || null;

  // Permission check function using the user's role
  const canAccess = (permission: string) => {
    return permissionCanAccess(permission, userRole);
  };

  const fetchProfileForSession = async (sessionData: SupabaseSession) => {
    if (!sessionData?.user) {
      console.log('No user in session data');
      return;
    }

    try {
      console.log('Fetching profile for user:', sessionData.user.id);
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
      });

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.user.id)
        .single();

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Error fetching basic profile:', error);
        
        // Create a basic user profile from session data if profile doesn't exist
        const basicUserProfile: UserProfile = {
          id: sessionData.user.id,
          name: sessionData.user.email?.split('@')[0] || 'User',
          email: sessionData.user.email || '',
          role: 'property_manager', // default role
          secondary_roles: [],
          custom_permissions: {}
        };
        
        console.log('Using basic profile from session:', basicUserProfile);
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
        
        // Check if user has authorized role for internal access
        const userRoleTyped = safeRoleCast(userProfile.role);
        if (!isAuthorizedRole(userRoleTyped)) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setError("Access denied: Unauthorized role");
          return;
        }
        
        setUser(userProfile);
        setError(null);
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
        
        console.log('Using fallback profile:', fallbackProfile);
        setUser(fallbackProfile);
        setError(null);
      }
    }
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

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);
        
        try {
          setSession(newSession);
          
          if (newSession?.user) {
            console.log('User session found, fetching profile');
            await fetchProfileForSession(newSession);
          } else {
            console.log('No user session, clearing user state');
            setUser(null);
            setError(null);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          setError(error instanceof Error ? error.message : 'Authentication error');
        } finally {
          console.log('Setting loading to false');
          setIsLoading(false);
        }
      }
    );

    // Check for existing session with timeout
    const sessionTimeout = setTimeout(async () => {
      try {
        console.log('Checking for existing session');
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
          setIsLoading(false);
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
        setError(error instanceof Error ? error.message : 'Session check failed');
      } finally {
        console.log('Initial session check complete, setting loading to false');
        setIsLoading(false);
      }
    }, 100);

    // Cleanup timeout if component unmounts
    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
      clearTimeout(sessionTimeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    return { error };
  };

  const signup = async (email: string, password: string, name: string) => {
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
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
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
    isLoading,
    isAuthenticated: !!user && !!session && user.role !== undefined && isAuthorizedRole(safeRoleCast(user.role)),
    error,
    userRole,
    canAccess,
    login,
    logout,
    signup,
    refreshProfile,
    updateProfile,
    updateAvatar,
    deleteUser,
    deleteAllUsers,
    fetchUsers,
    updateUserPermissions,
    getOfflineLoginStatus,
    // Aliases for backward compatibility
    signIn: login,
    signOut: logout,
    signUp: signup
  };

  return (
    <UserContext.Provider value={value}>
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
