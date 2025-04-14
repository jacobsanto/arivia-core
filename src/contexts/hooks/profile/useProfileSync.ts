
import { useState, useCallback } from "react";
import { User, UserRole } from "@/types/auth";
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
    console.log("Fetching profile data for user:", userId);
    
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

      console.log("Profile data received:", data);
      
      if (data && user) {
        // Update user with profile data - ensure proper type casting
        const updatedUser: User = {
          ...user,
          name: data.name || user.name,
          // Properly cast role to UserRole type
          role: data.role as UserRole || user.role,
          email: data.email || user.email,
          avatar: data.avatar || user.avatar,
          // Cast secondary_roles array elements to UserRole
          secondaryRoles: data.secondary_roles 
            ? data.secondary_roles.map((role: string) => role as UserRole) 
            : user.secondaryRoles,
          // Explicitly cast custom_permissions to the correct type
          customPermissions: data.custom_permissions 
            ? (typeof data.custom_permissions === 'object' 
                ? data.custom_permissions as Record<string, boolean> 
                : user.customPermissions) 
            : user.customPermissions
        };
        
        console.log("Updating user state with:", updatedUser);
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log("Profile data updated successfully");
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
    
    console.log("Refreshing user profile for:", user.id);
    
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
