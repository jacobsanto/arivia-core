import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, FEATURE_PERMISSIONS } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";
import { 
  hashPassword, 
  verifyPassword, 
  generateAuthToken, 
  verifyAuthToken, 
  saveAuthData, 
  clearAuthData 
} from "@/services/auth/authService";

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

// Mock users for demo purposes with enhanced security
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@ariviavillas.com",
    passwordHash: "YWRtaW4xMjN4eGprcnA=", // hashed version of "admin123"
    passwordSalt: "xxjkrp",
    name: "Admin User",
    role: "administrator" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "2",
    email: "manager@ariviavillas.com",
    passwordHash: "bWFuYWdlcjEyM2FiY2RlZg==", // hashed version of "manager123"
    passwordSalt: "abcdef",
    name: "Property Manager",
    role: "property_manager" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "3",
    email: "concierge@ariviavillas.com",
    passwordHash: "Y29uY2llcmdlMTIzZ2hpamts", // hashed version of "concierge123"
    passwordSalt: "ghijkl",
    name: "Concierge Staff",
    role: "concierge" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "4",
    email: "housekeeping@ariviavillas.com",
    passwordHash: "aG91c2VrZWVwaW5nMTIzbW5vcHFy", // hashed version of "housekeeping123"
    passwordSalt: "mnopqr",
    name: "Housekeeping Staff",
    role: "housekeeping_staff" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "5",
    email: "maintenance@ariviavillas.com",
    passwordHash: "bWFpbnRlbmFuY2UxMjNzdHV2d3g=", // hashed version of "maintenance123"
    passwordSalt: "stuvwx",
    name: "Maintenance Staff",
    role: "maintenance_staff" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "6",
    email: "inventory@ariviavillas.com",
    passwordHash: "aW52ZW50b3J5MTIzeXphYmM=", // hashed version of "inventory123"
    passwordSalt: "yzabc",
    name: "Inventory Manager",
    role: "inventory_manager" as UserRole,
    avatar: "/placeholder.svg"
  },
  {
    id: "7",
    email: "superadmin@ariviavillas.com",
    passwordHash: "c3VwZXJhZG1pbjEyM2RlZmdoaQ==", // hashed version of "superadmin123"
    passwordSalt: "defghi",
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
    // Check for existing auth token in localStorage
    const storedToken = localStorage.getItem("authToken");
    const storedAuthTime = localStorage.getItem("lastAuthTime");
    
    if (storedToken) {
      const { valid, userId, role } = verifyAuthToken(storedToken);
      
      if (valid) {
        // Token is valid, restore user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          if (storedAuthTime) {
            setLastAuthTime(parseInt(storedAuthTime, 10));
          }
        }
      } else {
        // Token expired or invalid, clear data
        clearAuthData();
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
      
      // Find user by email
      let foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (!foundUser) {
        // Check localStorage for custom registered users
        const customUsers = localStorage.getItem("users");
        if (customUsers) {
          const parsedUsers = JSON.parse(customUsers);
          const customUser = parsedUsers.find((u: any) => u.email === email);
          
          if (customUser && customUser.passwordHash) {
            foundUser = customUser;
          }
        }
      }
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Verify password
      const isPasswordValid = verifyPassword(
        password, 
        foundUser.passwordHash, 
        foundUser.passwordSalt
      );
      
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }
      
      // Generate auth token (24 hour expiry)
      const authToken = generateAuthToken(foundUser.id, foundUser.role, 24);
      
      // Remove sensitive data before storing user
      const { passwordHash, passwordSalt, ...userToStore } = foundUser;
      
      // Save authentication data
      saveAuthData(authToken, userToStore);
      setLastAuthTime(Date.now());
      
      // Update user state
      setUser(userToStore);
      
      // Success toast
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
    localStorage.removeItem("authToken");
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
