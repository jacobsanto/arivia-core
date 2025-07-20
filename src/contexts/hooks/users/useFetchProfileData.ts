
import { useCallback } from "react";
import { User, UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

// Simple throttling for profile fetches
let lastFetchTime = 0;
const THROTTLE_MS = 2000; // 2 seconds

export const useFetchProfileData = (
  user: User | null,
  setUser: (user: User | null) => void
) => {
  const fetchProfileData = useCallback(async (userId: string): Promise<boolean> => {
    // Check if we're in dev mode and should skip fetching
    const isDevMode = localStorage.getItem('arivia-dev-mode') === 'true';
    const mockUser = localStorage.getItem('arivia-mock-user');
    
    if (isDevMode && mockUser) {
      console.log("🔧 Skipping profile fetch in dev mode");
      return true;
    }

    const now = Date.now();
    if (now - lastFetchTime < THROTTLE_MS) {
      console.log("info: Profile fetch throttled, too many requests");
      return false;
    }
    lastFetchTime = now;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return false;
      }

      if (profile) {
        const updatedUser: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role as UserRole,
          avatar: profile.avatar || "/placeholder.svg",
          phone: profile.phone,
          secondaryRoles: profile.secondary_roles ? profile.secondary_roles.map(role => role as UserRole) : undefined,
          customPermissions: profile.custom_permissions as Record<string, boolean> || {}
        };

        setUser(updatedUser);
        console.log("Profile updated successfully:", updatedUser.name, updatedUser.role);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error in fetchProfileData:", error);
      return false;
    }
  }, [setUser]);

  return { fetchProfileData };
};
