
import { useState, useEffect, useRef, useCallback } from "react";
import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const profileSubscriptionRef = useRef<any>(null);
  const usersSubscriptionRef = useRef<any>(null);
  const profileFetchInProgress = useRef<boolean>(false);
  
  // Enable Supabase realtime for the profiles table
  useEffect(() => {
    if (navigator.onLine) {
      try {
        // Enable realtime for the profiles table
        supabase.from('profiles').select('count').then(() => {
          console.log('Realtime enabled for profiles table');
        });
      } catch (error) {
        console.error('Error enabling realtime:', error);
      }
    }
    
    return () => {
      // Clean up subscriptions
      if (profileSubscriptionRef.current) {
        supabase.removeChannel(profileSubscriptionRef.current);
        profileSubscriptionRef.current = null;
      }
      
      if (usersSubscriptionRef.current) {
        supabase.removeChannel(usersSubscriptionRef.current);
        usersSubscriptionRef.current = null;
      }
    };
  }, []);
  
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
      profileFetchInProgress.current = false;
    }
  }, [user]);

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
      return false;
    }
  }, [user, fetchProfileData]);
  
  // Set up subscription for current user profile updates
  useEffect(() => {
    if (!user) {
      // Clean up any existing subscription when user is null
      if (profileSubscriptionRef.current) {
        console.log("Cleaning up profile subscription: no current user");
        supabase.removeChannel(profileSubscriptionRef.current);
        profileSubscriptionRef.current = null;
      }
      return;
    }
    
    console.log("Setting up profile changes subscription for user:", user.id);
    
    // Clean up any existing subscription before creating a new one
    if (profileSubscriptionRef.current) {
      console.log("Removing existing profile subscription before creating new one");
      supabase.removeChannel(profileSubscriptionRef.current);
      profileSubscriptionRef.current = null;
    }
    
    // Subscribe to changes in the current user's profile for real-time updates
    const channel = supabase
      .channel(`profile-changes-${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, async (payload) => {
        console.log("Current user profile updated from database:", payload);
        
        // Use debounced refresh to prevent multiple rapid updates
        await refreshUserProfile();
      })
      .subscribe((status) => {
        console.log(`Profile subscription status: ${status}`);
      });
    
    // Store the subscription reference for cleanup
    profileSubscriptionRef.current = channel;
      
    return () => {
      console.log("Cleaning up profile changes subscription");
      if (profileSubscriptionRef.current) {
        supabase.removeChannel(profileSubscriptionRef.current);
        profileSubscriptionRef.current = null;
      }
    };
  }, [user, refreshUserProfile]);
  
  return {
    user,
    setUser,
    users,
    setUsers,
    fetchProfileData,
    refreshUserProfile
  };
};
