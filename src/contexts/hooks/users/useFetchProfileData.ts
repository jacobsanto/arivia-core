
import { useRef, useCallback } from "react";
import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook to fetch profile data from Supabase
 */
export const useFetchProfileData = (
  user: User | null
) => {
  const profileFetchInProgress = useRef<boolean>(false);

  // Function to fetch profile data from Supabase
  const fetchProfileData = useCallback(async (userId: string): Promise<boolean> => {
    if (!navigator.onLine) {
      console.log("Offline - cannot fetch profile data");
      return false;
    }
    
    // Prevent multiple simultaneous fetches for the same user
    if (profileFetchInProgress.current) {
      console.log("Profile fetch already in progress, skipping duplicate request");
      return false;
    }

    profileFetchInProgress.current = true;
    console.log("Fetching profile data for user:", userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile data:", error);
        // More specific error logging based on status
        if (error.code === '406') {
          console.error("Not Acceptable error - check content types");
        } else if (error.code === 'PGRST116') {
          console.error("Row not found in profiles table");
          toast.error("User profile not found", { 
            description: "Please contact admin to set up your account" 
          });
        }
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
        
        console.log("Profile data updated successfully, returning:", updatedUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
      return false;
    } finally {
      profileFetchInProgress.current = false;
    }
  }, [user]);

  return {
    fetchProfileData,
    profileFetchInProgress
  };
};
