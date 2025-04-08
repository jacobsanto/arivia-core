
import { User, UserRole } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";
import { 
  hashPassword, 
  verifyPassword, 
  generateAuthToken, 
  verifyAuthToken, 
  saveAuthData, 
  clearAuthData 
} from "@/services/auth/authService";

// Mock users for demo purposes with enhanced security
export const MOCK_USERS = [
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

// Authentication functions
export const loginUser = async (email: string, password: string): Promise<User> => {
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
  
  // Success toast
  toastService.success(`Welcome, ${userToStore.name}`, {
    description: "You have successfully logged in."
  });
  
  return userToStore;
};

export const logoutUser = (): void => {
  localStorage.removeItem("user");
  localStorage.removeItem("lastAuthTime");
  localStorage.removeItem("authToken");
  // Don't clear other data like custom users or offline data
  
  toastService.info("Logged Out", {
    description: "You have been successfully logged out."
  });
};

export const getUserFromStorage = (): { user: User | null; lastAuthTime: number } => {
  // Check for existing auth token in localStorage
  const storedToken = localStorage.getItem("authToken");
  const storedAuthTime = localStorage.getItem("lastAuthTime");
  let user = null;
  let lastAuthTime = 0;
  
  if (storedToken) {
    const { valid } = verifyAuthToken(storedToken);
    
    if (valid) {
      // Token is valid, restore user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        user = JSON.parse(storedUser);
        if (storedAuthTime) {
          lastAuthTime = parseInt(storedAuthTime, 10);
        }
      }
    } else {
      // Token expired or invalid, clear data
      clearAuthData();
    }
  }
  
  return { user, lastAuthTime };
};
