
import React, { createContext, useContext, useState, useEffect } from "react";
import { UserContextType } from "./types";
import { User, UserRole } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";
import { clearAuthData } from "@/services/auth/authService";
import { 
  authenticateUser, 
  validateSession, 
  hasPermission as checkPermission, 
  hasFeatureAccess as checkFeatureAccess,
  checkOfflineLoginStatus
} from "@/services/auth/userAuthService";

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastAuthTime, setLastAuthTime] = useState<number>(0);

  useEffect(() => {
    // Check for existing auth token and validate session
    const storedAuthTime = localStorage.getItem("lastAuthTime");
    const { valid, user: storedUser } = validateSession();
    
    if (valid && storedUser) {
      setUser(storedUser);
      if (storedAuthTime) {
        setLastAuthTime(parseInt(storedAuthTime, 10));
      }
    }
    
    // Set up online/offline detection
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsLoading(false);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authenticateUser(email, password);
      
      // Update state
      setUser(authenticatedUser);
      setLastAuthTime(Date.now());
      localStorage.setItem("lastAuthTime", Date.now().toString());
      
      // Success toast
      toastService.success(`Welcome, ${authenticatedUser.name}`, {
        description: "You have successfully logged in."
      });
      
    } catch (error) {
      toastService.error("Login Failed", {
        description: (error as Error).message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (user: User) => {
    setUser(user);
    setLastAuthTime(Date.now());
    localStorage.setItem("lastAuthTime", Date.now().toString());
  };

  const logout = () => {
    setUser(null);
    clearAuthData();
    
    toastService.info("Logged Out", {
      description: "You have been successfully logged out."
    });
  };

  const hasPermission = (roles: UserRole[]) => {
    return checkPermission(user, roles);
  };

  const hasFeatureAccess = (featureKey: string) => {
    return checkFeatureAccess(user, featureKey);
  };

  // Check if offline login is still valid
  const getOfflineLoginStatus = () => {
    return checkOfflineLoginStatus(user, lastAuthTime, isOffline);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      login,
      loginWithGoogle,
      logout, 
      hasPermission, 
      hasFeatureAccess,
      getOfflineLoginStatus 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
