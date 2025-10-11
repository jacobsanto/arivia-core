
// @ts-nocheck

import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast/toast.service";
import { User, UserRole } from "@/types/auth";
import { logger } from "@/services/logger";

// Function to sync user with their profile from Supabase
export const syncUserWithProfile = async (
  userId: string,
  setUser: (user: User | null) => void,
  currentUser: User | null
): Promise<boolean> => {
  try {
    if (!navigator.onLine) {
      logger.debug("Offline mode - skipping profile sync");
      return false;
    }

    // Fetch the latest profile data from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error("Error fetching profile", error);
      return false;
    }

    if (!profile) {
      logger.error("No profile found for user", { userId });
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
        
      logger.debug("Loaded custom permissions during sync", customPermissions);

      const updatedUser: User = {
        ...currentUser,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        avatar: profile.avatar || currentUser.avatar,
        phone: profile.phone,
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
    logger.error("Error syncing user profile", error);
    return false;
  }
};

// Function to update user profile data
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<{
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    secondaryRoles?: UserRole[];
    customPermissions?: Record<string, boolean>;
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

    logger.debug("Updating profile for user", { userId, profileData });

    // Convert to snake_case for Supabase
    const dbProfileData: any = {
      ...profileData,
      secondary_roles: profileData.secondaryRoles,
      custom_permissions: profileData.customPermissions
    };
    delete dbProfileData.secondaryRoles;
    delete dbProfileData.customPermissions;

    // Update profile in Supabase
    const { data, error } = await supabase
      .from('profiles')
      .update(dbProfileData)
      .eq('id', userId)
      .select(); // Add this to get the updated data

    if (error) {
      logger.error("Error updating profile", error);
      throw error;
    }

    logger.debug("Profile updated successfully in database", data);

    // If this is the current user, also update local state
    if (currentUser && currentUser.id === userId) {
      // After database update, sync the profile data to ensure we have all fields
      await syncUserWithProfile(userId, setUser, currentUser);
    } else {
      // For other users, we'll rely on real-time subscriptions to update the UI
      logger.debug("Updated user is not current user, relying on real-time updates");
    }

    toastService.success("Profile updated", {
      description: "The profile has been updated successfully"
    });

    return true;
  } catch (error) {
    logger.error("Error updating profile", error);
    toastService.error("Failed to update profile", {
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return false;
  }
};
