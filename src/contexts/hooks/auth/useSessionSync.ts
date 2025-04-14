
import { useEffect, useCallback, useRef } from "react";
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
  // Reference for profile fetch timeout
  const profileFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize auth state
  const initializeSession = useCallback(async () => {
    console.log("Initializing session...");
    const { data } = await supabase.auth.getSession();
    
    if (data.session) {
      // User authenticated with Supabase
      // Convert to our custom Session type
      const customSession: Session = {
        access_token: data.session.access_token,
        token_type: data.session.token_type,
        expires_in: data.session.expires_in,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.session.user.id,
          email: data.session.user.email || '',
          user_metadata: {
            name: data.session.user.user_metadata.name,
            role: data.session.user.user_metadata.role,
            avatar: data.session.user.user_metadata.avatar,
          },
        },
      };
      
      setSession(customSession);
      
      // Convert to our User format
      const userData: User = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
        role: data.session.user.user_metadata?.role as UserRole || 'property_manager',
        avatar: data.session.user.user_metadata?.avatar || "/placeholder.svg"
      };
      
      setUser(userData);
      setLastAuthTime(Date.now());
      
      // We no longer fetch profile data here to avoid redundancy
      // The profile data will be fetched by the auth state change handler
    } else {
      // Fall back to local storage for development
      const { user: storedUser, lastAuthTime: storedAuthTime } = getUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
        setLastAuthTime(storedAuthTime);
      }
    }
    
    setIsLoading(false);
  }, [setUser, setSession, setLastAuthTime, setIsLoading]);

  useEffect(() => {
    console.log("Setting up auth state listener...");

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, supaSession) => {
        console.log("Auth state change:", event);
        
        // Handle session change
        if (supaSession) {
          // Convert to our custom Session type
          const customSession: Session = {
            access_token: supaSession.access_token,
            token_type: supaSession.token_type,
            expires_in: supaSession.expires_in,
            refresh_token: supaSession.refresh_token,
            user: {
              id: supaSession.user.id,
              email: supaSession.user.email || '',
              user_metadata: {
                name: supaSession.user.user_metadata.name,
                role: supaSession.user.user_metadata.role,
                avatar: supaSession.user.user_metadata.avatar,
              },
            },
          };
          
          setSession(customSession);
          
          // Convert Supabase user to our User format
          const userData: User = {
            id: supaSession.user.id,
            email: supaSession.user.email || '',
            name: supaSession.user.user_metadata?.name || supaSession.user.email?.split('@')[0] || 'User',
            role: supaSession.user.user_metadata?.role as UserRole || 'property_manager',
            avatar: supaSession.user.user_metadata?.avatar || "/placeholder.svg"
          };
          
          setUser(userData);
          setLastAuthTime(Date.now());
          
          // For development, update mock storage too
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("lastAuthTime", Date.now().toString());
          
          // Clear any existing timeout to avoid multiple fetches
          if (profileFetchTimeoutRef.current) {
            clearTimeout(profileFetchTimeoutRef.current);
          }
          
          // Fetch profile data separately via setTimeout to avoid auth deadlock
          // and to ensure we don't have duplicate fetches
          profileFetchTimeoutRef.current = setTimeout(() => {
            console.log("Fetching profile data for user:", supaSession.user.id);
            fetchProfileData(supaSession.user.id).catch(err => {
              console.error("Error fetching profile data:", err);
            });
            profileFetchTimeoutRef.current = null;
          }, 200); // Increased delay for stability
        } else {
          setUser(null);
          setSession(null);
        }
      }
    );
    
    // THEN check for existing session
    initializeSession();
    
    return () => {
      subscription.unsubscribe();
      // Clear any pending profile fetch timeouts
      if (profileFetchTimeoutRef.current) {
        clearTimeout(profileFetchTimeoutRef.current);
      }
    };
  }, [setUser, setSession, setLastAuthTime, fetchProfileData, initializeSession]);
};
