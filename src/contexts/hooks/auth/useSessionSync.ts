
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, UserRole, UserStateSetter, StateSetter } from "@/types/auth";
import { getUserFromStorage } from "@/services/auth/userAuthService";
import { useAuth } from "@/contexts/AuthContext";

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
        // If central auth is not available, use local storage as fallback
        const { user: storedUser, lastAuthTime: storedAuthTime } = getUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
          setLastAuthTime(storedAuthTime);
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
