
import { useCallback } from "react";
import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { getUserFromStorage } from "@/services/auth/userAuthService";

export const useProfileSync = (
  user: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  // Function to fetch profile data from Supabase
  const fetchProfileData = useCallback(async (userId: string): Promise<boolean> => {
    if (!navigator.onLine) return false;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return false;
      }
      
      if (profile) {
        // Update user with the latest profile data, properly converting types
        setUser((currentUser) => {
          if (!currentUser) return null;
          
          // Convert the string[] to UserRole[] safely
          const secondaryRoles = profile.secondary_roles ? 
            profile.secondary_roles.map(role => role as UserRole) : 
            undefined;
          
          // Convert the JSON to Record<string, boolean> safely
          const customPermissions = profile.custom_permissions ? 
            (typeof profile.custom_permissions === 'object' ? 
              profile.custom_permissions as Record<string, boolean> : 
              {}) : 
            {};
          
          console.log("Loaded custom permissions from profile:", customPermissions);
          
          const updatedUser: User = {
            ...currentUser,
            name: profile.name || currentUser.name,
            email: profile.email || currentUser.email,
            role: profile.role as UserRole || currentUser.role,
            avatar: profile.avatar || currentUser.avatar,
            secondaryRoles,
            customPermissions
          };
          
          // Update localStorage for offline support
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          return updatedUser;
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error in profile fetch:", err);
      return false;
    }
  }, [setUser]);
  
  // Refresh profile data function that can be called from components
  const refreshUserProfile = useCallback(async (): Promise<boolean> => {
    if (user) {
      return await fetchProfileData(user.id);
    }
    return false;
  }, [user, fetchProfileData]);

  return {
    fetchProfileData,
    refreshUserProfile
  };
};
