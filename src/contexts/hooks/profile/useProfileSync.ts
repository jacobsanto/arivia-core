
import { useState, useCallback } from "react";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfileSync = (
  user: User | null,
  setUser: (user: User | null) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch profile data from Supabase
  const fetchProfileData = useCallback(async (userId: string): Promise<boolean> => {
    if (!navigator.onLine) {
      console.log("Offline - cannot fetch profile data");
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile data:", error);
        return false;
      }

      if (data && user) {
        // Update user with profile data
        const updatedUser: User = {
          ...user,
          name: data.name || user.name,
          role: data.role || user.role,
          email: data.email || user.email,
          avatar: data.avatar || user.avatar,
          secondaryRoles: data.secondary_roles || user.secondaryRoles,
          customPermissions: data.custom_permissions || user.customPermissions
        };
        
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log("Profile data updated:", updatedUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, setUser]);

  // Function to refresh the current user's profile
  const refreshUserProfile = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.log("No user to refresh profile for");
      return false;
    }
    
    try {
      const success = await fetchProfileData(user.id);
      if (success) {
        console.log("Profile refreshed successfully");
      } else {
        console.log("Failed to refresh profile");
      }
      return success;
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      toast.error("Failed to refresh user profile");
      return false;
    }
  }, [user, fetchProfileData]);

  return {
    fetchProfileData,
    refreshUserProfile,
    isLoading
  };
};
