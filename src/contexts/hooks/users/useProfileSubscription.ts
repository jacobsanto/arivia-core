
import { useRef, useEffect } from "react";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

export const useProfileSubscription = (
  user: User | null,
  refreshProfileFn: () => Promise<boolean>
) => {
  const profileSubscriptionRef = useRef<any>(null);

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
        event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, async (payload) => {
        console.log("Profile update detected:", payload);
        await refreshProfileFn();
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
    profileSubscriptionRef
  };
};
