
import { useAuthState } from "./auth/useAuthState";
import { useUserData } from "./users/useUserData";
import { useProfileSync } from "./profile/useProfileSync";
import { useSessionSync } from "./auth/useSessionSync";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Re-export the new refactored hook as useUserState for backwards compatibility
export const useUserState = () => {
  // Get auth state (session, online status, etc)
  const authState = useAuthState();
  
  // Get user data management
  const userData = useUserData();
  
  // Get profile sync functions
  const { fetchProfileData, refreshUserProfile } = useProfileSync(
    userData.user,
    userData.setUser
  );
  
  // Use session sync hook to tie everything together
  useSessionSync(
    userData.setUser,
    authState.setSession,
    authState.setLastAuthTime,
    authState.setIsLoading,
    fetchProfileData
  );
  
  // Subscribe to profile changes for the current user
  useEffect(() => {
    if (!userData.user) return;
    
    // Subscribe to changes in the current user's profile for real-time updates
    const channel = supabase
      .channel(`profile-changes-${userData.user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${userData.user.id}`
      }, async (payload) => {
        console.log("Current user profile updated:", payload);
        // Fetch full profile to ensure we get all related data
        await refreshUserProfile();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userData.user, refreshUserProfile]);
  
  // Return the combined state and functions
  return {
    ...authState,
    ...userData,
    refreshUserProfile
  };
};
