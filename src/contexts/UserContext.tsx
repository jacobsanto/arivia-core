import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  secondary_roles?: string[];
  custom_permissions?: Record<string, boolean>;
}

interface UserContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
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

  // Permission check function using the user's role
  const canAccess = (permission: string) => {
    return permissionCanAccess(permission, userRole);
  };

  const refreshProfile = async () => {
    if (!session?.user) return;
    
    try {
      // Try to fetch profile with roles joined from user_roles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner (
            roles!inner (
              name
            )
          )
        `)
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile with roles:', error);
        // Fallback to basic profile fetch
        const { data: basicProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (basicProfile) {
          const userProfile: UserProfile = {
            id: basicProfile.id,
            name: basicProfile.name,
            email: basicProfile.email,
            role: basicProfile.role,
            phone: basicProfile.phone,
            avatar: basicProfile.avatar,
            secondary_roles: basicProfile.secondary_roles || [],
            custom_permissions: safeConvertCustomPermissions(basicProfile.custom_permissions)
          };
          setUser(userProfile);
        }
        return;
      }
      
      if (profile) {
        // Extract role from the joined data - check if user_roles exists and has data
        const roleFromJoin = profile.user_roles && profile.user_roles.length > 0 
          ? profile.user_roles[0]?.roles?.name 
          : null;
        
        const userProfile: UserProfile = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: roleFromJoin || profile.role, // Use joined role or fallback to profile role
          phone: profile.phone,
          avatar: profile.avatar,
          secondary_roles: profile.secondary_roles || [],
          custom_permissions: safeConvertCustomPermissions(profile.custom_permissions)
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile with roles
          await refreshProfileForSession(session);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        refreshProfileForSession(session);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfileForSession = async (session: Session) => {
    try {
      // Try to fetch profile with roles joined
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner (
            roles!inner (
              name
            )
          )
        `)
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        const roleFromJoin = profile.user_roles && profile.user_roles.length > 0 
          ? profile.user_roles[0]?.roles?.name 
          : null;
        
        const userProfile: UserProfile = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: roleFromJoin || profile.role,
          phone: profile.phone,
          avatar: profile.avatar,
          secondary_roles: profile.secondary_roles || [],
          custom_permissions: safeConvertCustomPermissions(profile.custom_permissions)
        };
        setUser(userProfile);
      } else {
        // Fallback to basic profile if no roles are assigned
        const { data: basicProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (basicProfile) {
          const userProfile: UserProfile = {
            id: basicProfile.id,
            name: basicProfile.name,
            email: basicProfile.email,
            role: basicProfile.role,
            phone: basicProfile.phone,
            avatar: basicProfile.avatar,
            secondary_roles: basicProfile.secondary_roles || [],
            custom_permissions: safeConvertCustomPermissions(basicProfile.custom_permissions)
          };
          setUser(userProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
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

  const signOut = async () => {
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
    loading,
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
