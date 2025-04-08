
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastAuthTime, setLastAuthTime] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    // Load initial user data from storage
    const { user: storedUser, lastAuthTime: storedAuthTime } = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
      setLastAuthTime(storedAuthTime);
    }
    
    // Load users from localStorage or initialize with MOCK_USERS
    const storedUsers = localStorage.getItem("users");
    const initialUsers = storedUsers ? JSON.parse(storedUsers) : MOCK_USERS;
    setUsers(initialUsers);
    
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
  
  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);
      setLastAuthTime(Date.now());
    } catch (error) {
      toastService.error("Login Failed", {
        description: (error as Error).message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
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
