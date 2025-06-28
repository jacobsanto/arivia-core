
import { useEffect, useCallback } from "react";
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

  // Initialize auth state - now we only need minimal initialization since auth is handled by AuthContext
  const initializeSession = useCallback(async () => {
    try {
      // Use central auth state if available
      if (centralAuth.user && centralAuth.session) {
        console.log("Using central auth data for session initialization");
        // Sync with central auth state
        setUser(centralAuth.user);
        setSession(centralAuth.session);
        setLastAuthTime(Date.now());
      } else if (!centralAuth.isLoading) {
        console.log("No central auth data available, checking local storage");
        // If central auth is not loading and has no data, use local storage as fallback
        const { user: storedUser, lastAuthTime: storedAuthTime } = getUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
          setLastAuthTime(storedAuthTime);
        }
      }
    } catch (error) {
      console.error("Error during session initialization:", error);
    } finally {
      // Only mark loading as complete if central auth is also not loading
      if (!centralAuth.isLoading) {
        setIsLoading(false);
      }
    }
  }, [centralAuth.user, centralAuth.session, centralAuth.isLoading, setUser, setSession, setLastAuthTime, setIsLoading]);

  useEffect(() => {
    // Initialize the session
    initializeSession();
  }, [initializeSession]);

  // Update loading state based on central auth
  useEffect(() => {
    setIsLoading(centralAuth.isLoading);
  }, [centralAuth.isLoading, setIsLoading]);
};
