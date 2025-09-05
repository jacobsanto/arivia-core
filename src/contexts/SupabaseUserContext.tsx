import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, Session } from "@/types/auth";
import { UserContextType } from "./types/userContext.types";
import { supabase } from "@/integrations/supabase/client";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const SupabaseUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentIsLoading, setCurrentIsLoading] = useState(true);

  // For demo purposes, we'll use Iakovos as the main user
  const MAIN_USER_EMAIL = "iakovos@ariviagroup.com";

  useEffect(() => {
    // Fetch the main user profile from Supabase
    const fetchUserProfile = async () => {
      try {
        setCurrentIsLoading(true);
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', MAIN_USER_EMAIL)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to mock user if profile doesn't exist
          setCurrentUser({
            id: "e2779fd1-ff15-4a46-992d-85b8b4f72c4c",
            email: "iakovos@ariviagroup.com",
            name: "Iakovos Arampatzis",
            role: "superadmin" as UserRole,
            avatar: null,
            phone: "+30 694 123 4567",
            secondaryRoles: [],
            customPermissions: {}
          });
        } else {
          // Convert Supabase profile to User format
          setCurrentUser({
            id: profiles.id,
            email: profiles.email,
            name: profiles.name,
            role: profiles.role as UserRole,
            avatar: profiles.avatar,
            phone: profiles.phone,
            secondaryRoles: [],
            customPermissions: (profiles.custom_permissions as Record<string, boolean>) || {}
          });
        }

        // Create mock session
        setCurrentSession({
          access_token: "mock-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token",
          user: {
            id: "e2779fd1-ff15-4a46-992d-85b8b4f72c4c",
            email: "iakovos@ariviagroup.com",
            aud: "authenticated",
            role: "authenticated",
            app_metadata: {},
            user_metadata: { name: "Iakovos Arampatzis" },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            phone: "+30 694 123 4567",
            identities: []
          } as any
        });
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      } finally {
        setCurrentIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Mock actions for now - will be replaced with real Supabase auth later
  const handleLogin = async (email: string, password: string): Promise<void> => {
    console.log("Mock login - connecting to Supabase profiles");
  };

  const handleSignup = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "property_manager"
  ) => {
    console.log("Mock signup - connecting to Supabase profiles");
    return true;
  };

  const handleLogout = async () => {
    console.log("Mock logout - connecting to Supabase profiles");
  };

  const handleHasPermission = (roles: UserRole[]) => true; // Always allow for now
  const handleHasFeatureAccess = (featureKey: string) => true; // Always allow for now

  const handleGetOfflineLoginStatus = () => {
    return { isOfflineLoggedIn: true, timeRemaining: 999999 };
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
      console.error('Error updating permissions:', error);
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
      console.error('Error updating avatar:', error);
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
      console.error('Error deleting user:', error);
      return false;
    }
  };

  const handleSyncUserProfile = async () => {
    console.log("Mock profile sync - connecting to Supabase profiles");
    return true;
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
          .eq('id', userId)
          .single();
        
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
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const handleRefreshProfile = async () => {
    if (!currentUser) return false;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;

      setCurrentUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
        avatar: profile.avatar,
        phone: profile.phone,
        secondaryRoles: [],
        customPermissions: (profile.custom_permissions as Record<string, boolean>) || {}
      });

      return true;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return false;
    }
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
    throw new Error("useUser must be used within a SupabaseUserProvider");
  }
  return context;
};