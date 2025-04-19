
import { useRef, useEffect, useCallback } from "react";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to subscribe to profile changes in Supabase
 * 
 * @param user The current user object
 * @param refreshProfileFn Function to refresh the profile
 * @returns Object containing subscription reference and loading state
 */
export const useProfileSubscription = (
  user: User | null,
  refreshProfileFn: () => Promise<boolean>
) => {
  const profileSubscriptionRef = useRef<any>(null);
  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean function to remove channel and timeout
  const cleanUp = useCallback(() => {
    if (profileSubscriptionRef.current) {
      console.log("Removing profile subscription");
      supabase.removeChannel(profileSubscriptionRef.current);
      profileSubscriptionRef.current = null;
    }
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Handle profile changes debounced
  const handleProfileChange = useCallback(async () => {
    // Prevent refresh if another is in progress
    if (isRefreshingRef.current) {
      console.log("Profile refresh already in progress, skipping");
      return;
    }
    
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    // Implement exponential backoff for frequent updates
    if (timeSinceLastRefresh < 5000) {
      console.log(`Too soon for another refresh (${timeSinceLastRefresh}ms elapsed). Scheduling delayed refresh`);
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        handleProfileChange();
      }, 5000 - timeSinceLastRefresh);
      
      return;
    }
    
    // Set flags to prevent duplicate refreshes
    isRefreshingRef.current = true;
    lastRefreshTimeRef.current = now;
    
    try {
      // Immediate refresh when profile changes are detected
      const success = await refreshProfileFn();
      if (success) {
        console.log("Profile refreshed successfully after real-time update");
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      // Reset refresh flag
      isRefreshingRef.current = false;
    }
  }, [refreshProfileFn]);

  useEffect(() => {
    if (!user) {
      cleanUp();
      return;
    }
    
    console.log("Setting up profile changes subscription for user:", user.id);
    
    // Clean up existing subscription if any
    cleanUp();
    
    // Create new subscription
    const channel = supabase
      .channel(`profile-changes-${user.id}`)
      .on('postgres_changes', { 
        event: '*',
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, payload => {
        console.log("Profile update detected:", payload);
        handleProfileChange();
      })
      .subscribe((status) => {
        console.log(`Profile subscription status: ${status}`);
      });
    
    profileSubscriptionRef.current = channel;
      
    return () => {
      cleanUp();
    };
  }, [user, cleanUp, handleProfileChange]);

  return {
    profileSubscriptionRef,
    isRefreshing: isRefreshingRef.current
  };
};
