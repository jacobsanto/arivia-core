
import { useState, useEffect } from "react";
import { User, UserRole, Session } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { getUserFromStorage, MOCK_USERS } from "@/services/auth/userAuthService";

export const useUserState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastAuthTime, setLastAuthTime] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);

  // Initialize user state and online/offline detection
  useEffect(() => {
    // Load initial users from localStorage or initialize with MOCK_USERS
    const storedUsers = localStorage.getItem("users");
    const initialUsers = storedUsers ? JSON.parse(storedUsers) : MOCK_USERS;
    setUsers(initialUsers);
    
    // Set up online/offline detection
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, supaSession) => {
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
          
          // Fetch profile data separately via setTimeout to avoid auth deadlock
          setTimeout(() => {
            fetchProfileData(supaSession.user.id);
          }, 0);
        } else {
          setUser(null);
          setSession(null);
        }
      }
    );
    
    // THEN check for existing session
    const initializeUser = async () => {
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
        
        // Get the latest profile data
        fetchProfileData(data.session.user.id);
      } else {
        // Fall back to local storage for development
        const { user: storedUser, lastAuthTime: storedAuthTime } = getUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
          setLastAuthTime(storedAuthTime);
        }
      }
      
      setIsLoading(false);
    };
    
    initializeUser();
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Function to fetch profile data from Supabase
  const fetchProfileData = async (userId: string) => {
    if (!navigator.onLine) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (profile) {
        // Update user with the latest profile data, properly converting types
        setUser(currentUser => {
          if (!currentUser) return null;
          
          // Convert the string[] to UserRole[] safely
          const secondaryRoles = profile.secondary_roles ? 
            profile.secondary_roles.map(role => role as UserRole) : 
            undefined;
          
          // Convert the JSON to Record<string, boolean> safely
          const customPermissions = profile.custom_permissions ? 
            (typeof profile.custom_permissions === 'object' ? 
              profile.custom_permissions as Record<string, boolean> : 
              {}) : 
            undefined;
          
          const updatedUser: User = {
            ...currentUser,
            name: profile.name || currentUser.name,
            email: profile.email || currentUser.email,
            role: profile.role as UserRole || currentUser.role,
            avatar: profile.avatar || currentUser.avatar,
            secondaryRoles,
            customPermissions
          };
          
          // Update localStorage for offline support
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          return updatedUser;
        });
      }
    } catch (err) {
      console.error("Error in profile fetch:", err);
    }
  };
  
  // Refresh profile data function that can be called from components
  const refreshUserProfile = async (): Promise<boolean> => {
    if (user) {
      await fetchProfileData(user.id);
      return true;
    }
    return false;
  };
  
  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  return {
    user,
    setUser,
    session,
    setSession,
    isLoading,
    setIsLoading,
    isOffline,
    lastAuthTime,
    setLastAuthTime,
    users,
    setUsers,
    refreshUserProfile
  };
};
