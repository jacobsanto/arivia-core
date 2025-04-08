import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast/toast.service";
import { User, UserRole } from "@/types/auth";
import { 
  loginUser as mockLoginUser,
  logoutUser as mockLogoutUser
} from "@/services/auth/userAuthService";
import { 
  checkFeatureAccess, 
  checkRolePermission, 
  updatePermissions 
} from "@/services/auth/permissionService";
import { 
  checkOfflineLoginStatus
} from "@/services/auth/offlineService";

export const login = async (
  email: string, 
  password: string,
  setUser: (user: User) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  try {
    // Try Supabase authentication first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Success! Session is handled by onAuthStateChange
    toastService.success(`Welcome back!`, {
      description: "You have successfully logged in."
    });
    
    return;
  } catch (supaError) {
    console.error("Supabase login error:", supaError);
    
    try {
      // Fall back to mock authentication for development
      const loggedInUser = await mockLoginUser(email, password);
      setUser(loggedInUser);
      setLastAuthTime(Date.now());
    } catch (error) {
      toastService.error("Login Failed", {
        description: (error as Error).message
      });
      throw error;
    }
  } finally {
    setIsLoading(false);
  }
};

export const logout = async () => {
  // Supabase signout
  await supabase.auth.signOut();
  
  // Local cleanup
  mockLogoutUser();
};

export const hasPermission = (user: User | null, roles: UserRole[]) => {
  return checkRolePermission(user, roles);
};

export const hasFeatureAccess = (user: User | null, featureKey: string) => {
  return checkFeatureAccess(user, featureKey);
};

export const updateUserPermissions = (
  user: User | null, 
  users: User[], 
  setUsers: (users: User[]) => void, 
  setUser: (user: User | null) => void, 
  userId: string, 
  permissions: Record<string, boolean>
) => {
  // Only allow superadmins to modify permissions
  if (user?.role !== "superadmin") {
    toastService.error("Permission denied", {
      description: "Only Super Admins can modify user permissions"
    });
    return;
  }
  
  const updatedUsers = updatePermissions(users, userId, permissions);
  setUsers(updatedUsers);
  
  // If the current user's permissions were updated, update the state
  if (user?.id === userId) {
    setUser({
      ...user,
      customPermissions: permissions
    });
  }
  
  toastService.success("Permissions updated", {
    description: "User permissions have been updated successfully"
  });
};

export const getOfflineLoginStatus = (user: User | null, lastAuthTime: number, isOffline: boolean) => {
  return checkOfflineLoginStatus(user, lastAuthTime, isOffline);
};

export const updateUserAvatar = async (
  userId: string,
  avatarUrl: string,
  users: User[],
  setUsers: (users: User[]) => void,
  setUser: (user: User | null) => void,
  currentUser: User | null
) => {
  try {
    // Try to update Supabase profile
    if (navigator.onLine) {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar: avatarUrl })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
    }
    
    // Update local state
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, avatar: avatarUrl } : u
    );
    
    setUsers(updatedUsers);
    
    // If the current user's avatar was updated
    if (currentUser?.id === userId) {
      setUser({ ...currentUser, avatar: avatarUrl });
      
      // Update localStorage for offline support
      localStorage.setItem("user", JSON.stringify({ ...currentUser, avatar: avatarUrl }));
    }
    
    return true;
  } catch (error) {
    console.error("Error updating avatar:", error);
    toastService.error("Failed to update avatar", {
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return false;
  }
};

export const deleteUser = async (
  currentUser: User | null,
  users: User[],
  setUsers: (users: User[]) => void,
  userIdToDelete: string
) => {
  try {
    // Only allow superadmins to delete users
    if (currentUser?.role !== "superadmin") {
      toastService.error("Permission denied", {
        description: "Only Super Admins can delete users"
      });
      return false;
    }
    
    // Don't allow deleting self
    if (currentUser?.id === userIdToDelete) {
      toastService.error("Cannot delete your own account", {
        description: "You cannot delete your own account"
      });
      return false;
    }
    
    // Try to delete user in Supabase if online
    if (navigator.onLine) {
      // Delete user's avatar from storage if exists
      const user = users.find(u => u.id === userIdToDelete);
      if (user?.avatar && !user.avatar.includes('placeholder.svg')) {
        try {
          const filePath = `${userIdToDelete}/avatar`;
          await supabase.storage
            .from('avatars')
            .remove([filePath]);
        } catch (storageError) {
          console.error("Error deleting user avatar:", storageError);
          // Continue with user deletion even if avatar deletion fails
        }
      }
      
      // Delete the user from auth
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: userIdToDelete }
      });
      
      if (error) {
        throw error;
      }
    }
    
    // Update local state
    const updatedUsers = users.filter(u => u.id !== userIdToDelete);
    setUsers(updatedUsers);
    
    toastService.success("User deleted successfully", {
      description: "The user has been permanently deleted"
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    toastService.error("Failed to delete user", {
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return false;
  }
};

// New function to sync user with their profile from Supabase
export const syncUserWithProfile = async (
  userId: string,
  setUser: (user: User | null) => void,
  currentUser: User | null
): Promise<boolean> => {
  try {
    if (!navigator.onLine) {
      console.log("Offline mode - skipping profile sync");
      return false;
    }

    // Fetch the latest profile data from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return false;
    }

    if (!profile) {
      console.error("No profile found for user:", userId);
      return false;
    }

    // If we have a current user, update it with the latest profile data
    if (currentUser) {
      // Convert the string[] to UserRole[] safely
      const secondaryRoles = profile.secondary_roles ? 
        profile.secondary_roles.map(role => role as UserRole) : 
        undefined;
      
      // Convert the JSON to Record<string, boolean> safely
      const customPermissions = profile.custom_permissions ? 
        (typeof profile.custom_permissions === 'object' ? 
          profile.custom_permissions as Record<string, boolean> : 
          {}) : 
        undefined;

      const updatedUser: User = {
        ...currentUser,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar || currentUser.avatar,
        secondaryRoles,
        customPermissions
      };

      // Update state
      setUser(updatedUser);
      
      // Update localStorage for offline support
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error syncing user profile:", error);
    return false;
  }
};

// New function to update user profile data
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<{
    name: string;
    email: string;
    role: UserRole;
    secondaryRoles?: UserRole[];
  }>,
  setUser: (user: User | null) => void,
  currentUser: User | null
): Promise<boolean> => {
  try {
    if (!navigator.onLine) {
      toastService.error("Cannot update profile while offline", {
        description: "Please connect to the internet and try again"
      });
      return false;
    }

    // Convert to snake_case for Supabase
    const dbProfileData: any = {
      ...profileData,
      secondary_roles: profileData.secondaryRoles
    };
    delete dbProfileData.secondaryRoles;

    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update(dbProfileData)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    // If this is the current user, also update local state
    if (currentUser && currentUser.id === userId) {
      // After database update, sync the profile data to ensure we have all fields
      await syncUserWithProfile(userId, setUser, currentUser);
    }

    toastService.success("Profile updated", {
      description: "Your profile has been updated successfully"
    });

    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    toastService.error("Failed to update profile", {
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return false;
  }
};

// Re-export other functions for organization
export { 
  login, 
  logout, 
  hasPermission, 
  hasFeatureAccess, 
  updateUserPermissions as updatePermissions,
  updateUserAvatar as updateAvatar,
  deleteUser as removeUser,
  getOfflineLoginStatus
} from "@/services/auth/userAuthService";
