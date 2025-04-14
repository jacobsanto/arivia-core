
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
    try {
      // First check local storage for faster initial render
      const { user: storedUser, lastAuthTime: storedAuthTime } = getUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
        setLastAuthTime(storedAuthTime);
      }
      
      // Then check with Supabase
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Set the full session with the complete Supabase User object
        setSession(data.session);
        
        // Convert to our User format - basic info only
        const userData: User = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
          role: data.session.user.user_metadata?.role as UserRole || 'property_manager',
          avatar: data.session.user.user_metadata?.avatar || "/placeholder.svg"
        };
        
        setUser(userData);
        setLastAuthTime(Date.now());
        
        // Fetch additional profile data if needed
        setTimeout(() => {
          fetchProfileData(data.session.user.id).catch(console.error);
        }, 100);
      }
    } catch (error) {
      console.error("Error during session initialization:", error);
    } finally {
      // Mark loading as complete regardless of outcome
      setIsLoading(false);
    }
  }, [setUser, setSession, setLastAuthTime, setIsLoading, fetchProfileData]);

  useEffect(() => {
    // Set loading state first
    setIsLoading(true);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event);
        
        // Handle session change
        if (session) {
          // Set the complete session object
          setSession(session);
          
          // Convert Supabase user to our User format
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role as UserRole || 'property_manager',
            avatar: session.user.user_metadata?.avatar || "/placeholder.svg"
          };
          
          setUser(userData);
          setLastAuthTime(Date.now());
          
          // For development, update mock storage too
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("lastAuthTime", Date.now().toString());
          
          // Fetch profile data with a delay to avoid auth deadlock
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setTimeout(() => {
              fetchProfileData(session.user.id);
            }, 100);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    );
    
    // Initialize session
    initializeSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [initializeSession, setIsLoading, setLastAuthTime, setSession, setUser, fetchProfileData]);
};
