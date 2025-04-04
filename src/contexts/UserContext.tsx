
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types/auth";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
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

  useEffect(() => {
    // Check for existing user session in local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user in mock data
      const foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Remove password from user object before storing
      const { password: _, ...userToStore } = foundUser;
      
      // Store user in state and local storage
      setUser(userToStore);
      localStorage.setItem("user", JSON.stringify(userToStore));
      return;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const hasPermission = (roles: UserRole[]) => {
    if (!user) return false;
    
    // Superadmin has access to everything
    if (user.role === "superadmin") return true;
    
    // Check if user role is in the allowed roles
    return roles.includes(user.role);
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>
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
