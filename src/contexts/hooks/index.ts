
import { useAuthState } from "./auth/useAuthState";
import { useUserData } from "./users/useUserData";
import { useProfileSync } from "./profile/useProfileSync";
import { useSessionSync } from "./auth/useSessionSync";
import { useState, useEffect, useRef } from "react";
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
    if (!userData.user) {
      // Clean up any existing subscription when user is null
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      return;
    }
    
    console.log("Setting up profile changes subscription for user:", userData.user.id);
    
    // Clean up any existing subscription before creating a new one
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
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
        // Use a small delay to prevent potential race conditions
        setTimeout(async () => {
          await refreshUserProfile();
        }, 200);
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
    };
  }, [userData.user, refreshUserProfile]);
  
  // Return the combined state and functions
  return {
    ...authState,
    ...userData,
    refreshUserProfile
  };
};
