
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
  
  // Get profile data fetching functionality with user state updater
  const { fetchProfileData } = useFetchProfileData(user, setUser);
  
  // Function to refresh the current user's profile
  const refreshUserProfile = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.log("No user to refresh profile for");
      return false;
    }
    
    // Check if we're in dev mode and should skip profile fetching
    const isDevMode = localStorage.getItem('arivia-dev-mode') === 'true';
    const mockUser = localStorage.getItem('arivia-mock-user');
    
    if (isDevMode && mockUser) {
      console.log("🔧 Skipping profile refresh in dev mode with mock user");
      return true; // Return true since we don't need to fetch
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
  
  // Set up subscription for current user profile updates (only if not in dev mode)
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
