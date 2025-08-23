
import { useEffect, useRef } from "react";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

export const useProfileSubscription = (
  user: User | null,
  refreshUserProfile: () => Promise<boolean>
) => {
  const subscriptionRef = useRef<any>(null);
  
  useEffect(() => {

    // Clean up previous subscription
    if (subscriptionRef.current) {
      console.log("info: Removing profile subscription");
      supabase.removeChannel(subscriptionRef.current);
      console.log("info: Profile subscription status:", subscriptionRef.current.state);
    }

    if (!user) return;

    console.log("info: Setting up profile changes subscription for user:", user.id);

    // Subscribe to profile changes for the current user
    subscriptionRef.current = supabase
      .channel(`profile-changes-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        console.log("Profile updated via subscription:", payload);
        refreshUserProfile();
      })
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        console.log("info: Removing profile subscription");
        supabase.removeChannel(subscriptionRef.current);
        console.log("info: Profile subscription status:", subscriptionRef.current.state);
      }
    };
  }, [user, refreshUserProfile]);
};
