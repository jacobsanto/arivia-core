
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, Session } from "@/types/auth";
import { toast } from "sonner";
import { toastService } from "@/services/toast/toast.service";
import { supabase } from "@/integrations/supabase/client";
import { 
  loginUser, 
  logoutUser, 
  getUserFromStorage, 
  MOCK_USERS 
} from "@/services/auth/userAuthService";
import { 
  checkFeatureAccess, 
  checkRolePermission, 
  updatePermissions 
} from "@/services/auth/permissionService";
import { 
  getUserOfflineCapabilities, 
  hasOfflineAccess, 
  checkOfflineLoginStatus 
} from "@/services/auth/offlineService";

interface UserContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
  hasFeatureAccess: (featureKey: string) => boolean;
  getOfflineLoginStatus: () => boolean;
  updateUserPermissions: (userId: string, permissions: Record<string, boolean>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastAuthTime, setLastAuthTime] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  
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
  
  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try Supabase authentication first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Success! Session is handled by onAuthStateChange
      toastService.success(`Welcome back!`, {
        description: "You have successfully logged in."
      });
      
      return;
    } catch (supaError) {
      console.error("Supabase login error:", supaError);
      
      try {
        // Fall back to mock authentication for development
        const loggedInUser = await loginUser(email, password);
        setUser(loggedInUser);
        setLastAuthTime(Date.now());
      } catch (error) {
        toastService.error("Login Failed", {
          description: (error as Error).message
        });
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Supabase signout
    await supabase.auth.signOut();
    
    // Local cleanup
    setUser(null);
    setSession(null);
    logoutUser();
  };

  const hasPermission = (roles: UserRole[]) => {
    return checkRolePermission(user, roles);
  };

  const hasFeatureAccess = (featureKey: string) => {
    return checkFeatureAccess(user, featureKey);
  };

  const updateUserPermissions = (userId: string, permissions: Record<string, boolean>) => {
    // Only allow superadmins to modify permissions
    if (user?.role !== "superadmin") {
      toastService.error("Permission denied", {
        description: "Only Super Admins can modify user permissions"
      });
      return;
    }
    
    const updatedUsers = updatePermissions(users, userId, permissions);
    setUsers(updatedUsers);
    
    // If the current user's permissions were updated, update the state
    if (user?.id === userId) {
      setUser({
        ...user,
        customPermissions: permissions
      });
    }
    
    toastService.success("Permissions updated", {
      description: "User permissions have been updated successfully"
    });
  };

  const getOfflineLoginStatus = () => {
    return checkOfflineLoginStatus(user, lastAuthTime, isOffline);
  };

  return (
    <UserContext.Provider value={{ 
      user,
      session,
      isLoading, 
      login, 
      logout, 
      hasPermission, 
      hasFeatureAccess,
      getOfflineLoginStatus,
      updateUserPermissions
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
