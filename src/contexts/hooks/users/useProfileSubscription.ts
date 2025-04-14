
import { useRef, useEffect } from "react";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to manage Supabase realtime subscription for a user's profile
 */
export const useProfileSubscription = (
  user: User | null,
  refreshProfileFn: () => Promise<boolean>
) => {
  const profileSubscriptionRef = useRef<any>(null);

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
        await refreshProfileFn();
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
  }, [user, refreshProfileFn]);

  return {
    profileSubscriptionRef
  };
};
