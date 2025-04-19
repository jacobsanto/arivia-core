
import { useState, useCallback } from "react";
import { User, UserRole } from "@/types/auth";
import { useRealtimeSetup } from "./useRealtimeSetup";
import { useProfileSubscription } from "./useProfileSubscription";
import { useFetchProfileData } from "./useFetchProfileData";

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Set up Supabase realtime
  useRealtimeSetup();
  
  // Get profile data fetching functionality
  const { fetchProfileData } = useFetchProfileData(user);
  
  // Function to refresh the current user's profile
  const refreshUserProfile = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.log("No user to refresh profile for");
      return false;
    }
    
    console.log("Refreshing user profile for:", user.id);
    
    try {
      const result = await fetchProfileData(user.id);
      if (result) {
        console.log("Profile refreshed successfully");
      } else {
        console.log("Failed to refresh profile");
      }
      return result;
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      return false;
    }
  }, [user, fetchProfileData]);
  
  // Set up subscription for current user profile updates
  useProfileSubscription(user, refreshUserProfile);
  
  return {
    user,
    setUser,
    users,
    setUsers,
    fetchProfileData,
    refreshUserProfile
  };
};
