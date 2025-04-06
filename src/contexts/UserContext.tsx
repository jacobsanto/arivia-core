
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, FEATURE_PERMISSIONS } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
  hasFeatureAccess: (featureKey: string) => boolean;
  getOfflineLoginStatus: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@ariviavillas.com",
    password: "admin123",
    name: "Admin User",
    role: "administrator" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "2",
    email: "manager@ariviavillas.com",
    password: "manager123",
    name: "Property Manager",
    role: "property_manager" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "3",
    email: "concierge@ariviavillas.com",
    password: "concierge123",
    name: "Concierge Staff",
    role: "concierge" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "4",
    email: "housekeeping@ariviavillas.com",
    password: "housekeeping123",
    name: "Housekeeping Staff",
    role: "housekeeping_staff" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "5",
    email: "maintenance@ariviavillas.com",
    password: "maintenance123",
    name: "Maintenance Staff",
    role: "maintenance_staff" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "6",
    email: "inventory@ariviavillas.com",
    password: "inventory123",
    name: "Inventory Manager",
    role: "inventory_manager" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "7",
    email: "superadmin@ariviavillas.com",
    password: "superadmin123",
    name: "Super Admin",
    role: "superadmin" as UserRole,
    avatar: "/placeholder.svg"
  }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastAuthTime, setLastAuthTime] = useState<number>(0);

  useEffect(() => {
    // Check for existing user session in local storage
    const storedUser = localStorage.getItem("user");
    const storedAuthTime = localStorage.getItem("lastAuthTime");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user in mock data or custom registered users
      let foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        // Check localStorage for custom registered users
        const customUsers = localStorage.getItem("users");
        if (customUsers) {
          const parsedUsers = JSON.parse(customUsers);
          const customUser = parsedUsers.find((u: any) => u.email === email);
          
          if (customUser) {
            // In a real app, we would check password hash here
            foundUser = {
              ...customUser,
              password
            };
          }
        }
      }
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Remove password from user object before storing
      const { password: _, ...userToStore } = foundUser;
      
      // Store auth timestamp (for offline login expiration)
      const currentTime = Date.now();
      localStorage.setItem("lastAuthTime", currentTime.toString());
      setLastAuthTime(currentTime);
      
      // Store user in state and local storage
      setUser(userToStore);
      localStorage.setItem("user", JSON.stringify(userToStore));
      
      // Show success toast
      toastService.success(`Welcome, ${userToStore.name}`, {
        description: "You have successfully logged in."
      });
      
      return;
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
    localStorage.removeItem("user");
    localStorage.removeItem("lastAuthTime");
    // Don't clear other data like custom users or offline data
    
    toastService.info("Logged Out", {
      description: "You have been successfully logged out."
    });
  };

  const hasPermission = (roles: UserRole[]) => {
    if (!user) return false;
    
    // Superadmin has access to everything
    if (user.role === "superadmin") return true;
    
    // Check if user role is in the allowed roles
    return roles.includes(user.role);
  };

  const hasFeatureAccess = (featureKey: string) => {
    if (!user) return false;
    
    // Superadmin has access to everything
    if (user.role === "superadmin") return true;
    
    // Check if feature exists in permissions
    const permission = FEATURE_PERMISSIONS[featureKey];
    if (!permission) return false;
    
    // Check if user's role is in the allowed roles
    return permission.allowedRoles.includes(user.role);
  };

  // Check if offline login is still valid (within 7 days)
  const getOfflineLoginStatus = () => {
    if (!user || !lastAuthTime) return false;
    
    // If online, always allow access
    if (!isOffline) return true;
    
    // If offline, check if authentication is expired (7 days)
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    
    // If more than 7 days since last auth, session is expired
    if (now - lastAuthTime > sevenDaysMs) {
      // Show a toast warning
      toastService.warning("Offline session expired", {
        description: "Please go online to re-authenticate."
      });
      return false;
    }
    
    return true;
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      hasPermission, 
      hasFeatureAccess,
      getOfflineLoginStatus 
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
