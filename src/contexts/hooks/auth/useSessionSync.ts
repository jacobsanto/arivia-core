
import { useEffect, useCallback } from "react";
import { User, UserRole, Session } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { getUserFromStorage } from "@/services/auth/userAuthService";

export const useSessionSync = (
  setUser: (user: User | null) => void,
  setSession: (session: Session | null) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (isLoading: boolean) => void,
  fetchProfileData: (userId: string) => Promise<boolean>
) => {
  // Initialize auth state
  const initializeSession = useCallback(async () => {
    console.log("Initializing session...");
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // User authenticated with Supabase
        console.log("Found existing session:", data.session.user.id);
        // Convert to our custom Session type
        const customSession: Session = {
          access_token: data.session.access_token,
          token_type: data.session.token_type,
          expires_in: data.session.expires_in,
          refresh_token: data.session.refresh_token, // This is now required
          user: {
            id: data.session.user.id,
            email: data.session.user.email || '',
            user_metadata: {
              name: data.session.user.user_metadata?.name,
              role: data.session.user.user_metadata?.role,
              avatar: data.session.user.user_metadata?.avatar,
            },
          },
        };
        
        setSession(customSession);
        
        // Convert to our User format - basic info only
        // Detailed profile data will be fetched separately
        const userData: User = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
          role: data.session.user.user_metadata?.role as UserRole || 'property_manager',
          avatar: data.session.user.user_metadata?.avatar || "/placeholder.svg"
        };
        
        setUser(userData);
        setLastAuthTime(Date.now());
        console.log("User state initialized:", userData);
        
        // Do NOT fetch profile data immediately - this causes race conditions
        // We'll rely on the auth state change event to fetch profile data
      } else {
        console.log("No existing session found");
        // Fall back to local storage for development
        const { user: storedUser, lastAuthTime: storedAuthTime } = getUserFromStorage();
        if (storedUser) {
          console.log("Found user in local storage:", storedUser.id);
          setUser(storedUser);
          setLastAuthTime(storedAuthTime);
        }
      }
    } catch (error) {
      console.error("Error during session initialization:", error);
      // Fall back to local storage in case of error
      const { user: storedUser, lastAuthTime: storedAuthTime } = getUserFromStorage();
      if (storedUser) {
        console.log("Using fallback from local storage due to error");
        setUser(storedUser);
        setLastAuthTime(storedAuthTime);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setSession, setLastAuthTime, setIsLoading, fetchProfileData]);

  useEffect(() => {
    console.log("Setting up auth state listener...");
    setIsLoading(true);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, supaSession) => {
        console.log("Auth state change:", event);
        
        // Handle session change
        if (supaSession) {
          console.log("Session user:", supaSession.user.id);
          // Convert to our custom Session type
          const customSession: Session = {
            access_token: supaSession.access_token,
            token_type: supaSession.token_type,
            expires_in: supaSession.expires_in,
            refresh_token: supaSession.refresh_token, // This is now required
            user: {
              id: supaSession.user.id,
              email: supaSession.user.email || '',
              user_metadata: {
                name: supaSession.user.user_metadata?.name,
                role: supaSession.user.user_metadata?.role,
                avatar: supaSession.user.user_metadata?.avatar,
              },
            },
          };
          
          setSession(customSession);
          
          // Convert Supabase user to our User format - basic info only
          const userData: User = {
            id: supaSession.user.id,
            email: supaSession.user.email || '',
            name: supaSession.user.user_metadata?.name || supaSession.user.email?.split('@')[0] || 'User',
            role: supaSession.user.user_metadata?.role as UserRole || 'property_manager',
            avatar: supaSession.user.user_metadata?.avatar || "/placeholder.svg"
          };
          
          setUser(userData);
          setLastAuthTime(Date.now());
          console.log("User state updated:", userData);
          
          // For development, update mock storage too
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("lastAuthTime", Date.now().toString());
          
          // Fetch profile data with a slight delay to avoid auth deadlock
          // Only fetch if the event is SIGNED_IN or TOKEN_REFRESHED
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setTimeout(() => {
              fetchProfileData(supaSession.user.id).catch(err => {
                console.error("Error fetching profile data:", err);
              });
            }, 500);
          }
        } else {
          console.log("No session in auth state change");
          if (event === 'SIGNED_OUT') {
            console.log("User signed out, clearing state");
            setUser(null);
            setSession(null);
          }
        }
      }
    );
    
    // THEN check for existing session
    initializeSession();
    
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLastAuthTime, fetchProfileData, initializeSession, setIsLoading]);
};
