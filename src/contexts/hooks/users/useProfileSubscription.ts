
import { useRef, useEffect } from "react";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

export const useProfileSubscription = (
  user: User | null,
  refreshProfileFn: () => Promise<boolean>
) => {
  const profileSubscriptionRef = useRef<any>(null);
  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);

  useEffect(() => {
    if (!user) {
      if (profileSubscriptionRef.current) {
        console.log("Cleaning up profile subscription: no current user");
        supabase.removeChannel(profileSubscriptionRef.current);
        profileSubscriptionRef.current = null;
      }
      return;
    }
    
    console.log("Setting up profile changes subscription for user:", user.id);
    
    if (profileSubscriptionRef.current) {
      console.log("Removing existing profile subscription before creating new one");
      supabase.removeChannel(profileSubscriptionRef.current);
      profileSubscriptionRef.current = null;
    }
    
    const channel = supabase
      .channel(`profile-changes-${user.id}`)
      .on('postgres_changes', { 
        event: '*',
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, async (payload) => {
        console.log("Profile update detected:", payload);
        
        // Prevent refresh if another is in progress or if it's too soon
        const now = Date.now();
        if (isRefreshingRef.current || now - lastRefreshTimeRef.current < 5000) {
          console.log("Skipping profile refresh - in progress or too recent");
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
        } finally {
          // Reset refresh flag
          isRefreshingRef.current = false;
        }
      })
      .subscribe((status) => {
        console.log(`Profile subscription status: ${status}`);
      });
    
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
    profileSubscriptionRef,
    isRefreshing: isRefreshingRef.current
  };
};
