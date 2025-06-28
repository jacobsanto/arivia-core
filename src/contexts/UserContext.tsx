
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
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

  const refreshProfile = async () => {
    if (!session?.user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
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
      setUser(userProfile);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
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
            setUser(userProfile);
          }
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
        // Fetch user profile if session exists
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
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
              setUser(userProfile);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    setUser({ ...user, ...updates });
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
    
    // If updating current user, refresh their profile
    if (userId === user?.id) {
      await refreshProfile();
    }
  };

  const deleteUser = async (userId: string) => {
    // Delete user profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const deleteAllUsers = async () => {
    if (!user) return;
    
    // Delete all users except current user
    const { error } = await supabase
      .from('profiles')
      .delete()
      .neq('id', user.id);
    
    if (error) {
      console.error('Error deleting all users:', error);
      throw error;
    }
  };

  const fetchUsers = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return (data || []).map(profile => ({
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
    return !!session && !!user;
  };

  const value: UserContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    deleteUser,
    deleteAllUsers,
    fetchUsers,
    // Alias methods
    login: signIn,
    logout: signOut,
    signup: signUp,
    // Additional methods
    refreshProfile,
    updateAvatar,
    updateUserPermissions,
    getOfflineLoginStatus,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
