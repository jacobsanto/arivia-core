
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, UserRole, UserStateSetter, StateSetter } from "@/types/auth";
import { getCurrentSession } from "@/services/auth/secureAuthService";
import { useAuth } from "@/auth";

export const useSessionSync = (
  setUser: UserStateSetter,
  setSession: StateSetter<Session | null>,
  setLastAuthTime: StateSetter<number>,
  setIsLoading: StateSetter<boolean>,
  fetchProfileData: (userId: string) => Promise<boolean>
) => {
  // Get the central auth state
  const centralAuth = useAuth();

  // Initialize auth state - now we only need to fetch profile data since auth is handled by AuthContext
  const initializeSession = useCallback(async () => {
    try {
      // Use central auth state if available
      if (centralAuth.user && centralAuth.session) {
        console.log("Using central auth data for session initialization");
        // Update the user state with the central auth state
        setUser(centralAuth.user);
        setSession(centralAuth.session);
        setLastAuthTime(Date.now());
        
        // Fetch additional profile data with delay to prevent auth deadlock
        setTimeout(() => {
          fetchProfileData(centralAuth.user.id).catch(console.error);
        }, 100);
      } else {
        console.log("No central auth data available, using local storage");
        // Try to get session from Supabase as fallback
        const session = await getCurrentSession();
        if (session?.user) {
          // Convert to our User format if needed
          const storedUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'housekeeping_staff',
            avatar: session.user.user_metadata?.avatar || "/placeholder.svg"
          };
          setUser(storedUser);
          setLastAuthTime(Date.now());
        }
      }
    } catch (error) {
      console.error("Error during session initialization:", error);
    } finally {
      // Mark loading as complete regardless of outcome
      setIsLoading(false);
    }
  }, [centralAuth.user, centralAuth.session, setUser, setSession, setLastAuthTime, setIsLoading, fetchProfileData]);

  useEffect(() => {
    // Set loading state first
    setIsLoading(true);
    
    // Initialize the session
    initializeSession();
    
    // No need to set up auth state listener as it's handled by AuthContext
    
  }, [initializeSession, setIsLoading]);
};
