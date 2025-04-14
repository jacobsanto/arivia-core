
import { useAuthState } from "./auth/useAuthState";
import { useUserData } from "./users/useUserData";
import { useProfileSync } from "./profile/useProfileSync";
import { useSessionSync } from "./auth/useSessionSync";
import { useState, useEffect, useRef, useCallback } from "react";
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
  
  // Reference to track subscription
  const subscriptionRef = useRef<any>(null);
  
  // Reference to track debounced profile updates
  const profileUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use session sync hook to tie everything together
  useSessionSync(
    userData.setUser,
    authState.setSession,
    authState.setLastAuthTime,
    authState.setIsLoading,
    fetchProfileData
  );
  
  // Debounced version of refresh profile to prevent multiple rapid updates
  const debouncedRefreshProfile = useCallback(() => {
    // Clear any pending refresh
    if (profileUpdateTimeoutRef.current) {
      clearTimeout(profileUpdateTimeoutRef.current);
    }
    
    // Schedule new refresh with delay
    profileUpdateTimeoutRef.current = setTimeout(async () => {
      console.log("Executing debounced profile refresh");
      await refreshUserProfile();
      profileUpdateTimeoutRef.current = null;
    }, 500); // 500ms debounce time
  }, [refreshUserProfile]);
  
  // Subscribe to profile changes for the current user
  useEffect(() => {
    if (!userData.user) {
      // Clean up any existing subscription when user is null
      if (subscriptionRef.current) {
        console.log("Cleaning up profile subscription: no current user");
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      return;
    }
    
    console.log("Setting up profile changes subscription for user:", userData.user.id);
    
    // Clean up any existing subscription before creating a new one
    if (subscriptionRef.current) {
      console.log("Removing existing profile subscription before creating new one");
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    // Subscribe to changes in the current user's profile for real-time updates
    const channel = supabase
      .channel(`profile-changes-${userData.user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${userData.user.id}`
      }, async (payload) => {
        console.log("Current user profile updated from database:", payload);
        // Use debounced refresh to prevent multiple rapid updates
        debouncedRefreshProfile();
      })
      .subscribe((status) => {
        console.log(`Profile subscription status: ${status}`);
      });
    
    // Store the subscription reference for cleanup
    subscriptionRef.current = channel;
      
    return () => {
      console.log("Cleaning up profile changes subscription");
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      
      // Also clean up any pending profile updates
      if (profileUpdateTimeoutRef.current) {
        clearTimeout(profileUpdateTimeoutRef.current);
        profileUpdateTimeoutRef.current = null;
      }
    };
  }, [userData.user, debouncedRefreshProfile]);
  
  // Return the combined state and functions
  return {
    ...authState,
    ...userData,
    refreshUserProfile
  };
};
