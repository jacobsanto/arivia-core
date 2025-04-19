
import { useRef, useCallback } from "react";
import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFetchProfileData = (
  user: User | null,
  setUser?: (user: User | null) => void
) => {
  const profileFetchInProgress = useRef<boolean>(false);
  const lastFetchTime = useRef<number>(0);

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
    
    // Throttle fetches to prevent excessive API calls
    const now = Date.now();
    if (now - lastFetchTime.current < 5000) {
      console.log("Profile fetch throttled, too many requests");
      return false;
    }

    profileFetchInProgress.current = true;
    lastFetchTime.current = now;
    console.log("Fetching profile data for user:", userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile data:", error);
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
      
      if (data && user && setUser) {
        // Update user with profile data
        const updatedUser: User = {
          ...user,
          name: data.name || user.name,
          role: data.role as UserRole || user.role,
          email: data.email || user.email,
          avatar: data.avatar || user.avatar,
          secondaryRoles: data.secondary_roles 
            ? data.secondary_roles.map((role: string) => role as UserRole) 
            : user.secondaryRoles,
          customPermissions: data.custom_permissions 
            ? (typeof data.custom_permissions === 'object' 
                ? data.custom_permissions as Record<string, boolean> 
                : user.customPermissions) 
            : user.customPermissions
        };
        
        setUser(updatedUser);
        
        // Use localStorage to cache the user profile
        try {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (e) {
          console.error("Failed to cache user profile in localStorage:", e);
        }
        
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
  }, [user, setUser]);

  return {
    fetchProfileData,
    profileFetchInProgress,
    lastFetchTime
  };
};
