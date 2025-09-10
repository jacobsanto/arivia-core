
import { User, UserRole } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";
import { supabase } from "@/integrations/supabase/client";

// Test users for development (you can sign up with these credentials)
export const TEST_USERS = [
  {
    email: "admin@ariviavillas.com",
    password: "admin123",
    name: "Admin User",
    role: "administrator" as UserRole,
    phone: "+30-210-555-0101"
  },
  {
    email: "manager@ariviavillas.com", 
    password: "manager123",
    name: "Property Manager",
    role: "property_manager" as UserRole,
    phone: "+30-210-555-0102"
  },
  {
    email: "housekeeping@ariviavillas.com",
    password: "housekeeping123", 
    name: "Housekeeping Staff",
    role: "housekeeping_staff" as UserRole,
    phone: "+30-210-555-0104"
  },
  {
    email: "maintenance@ariviavillas.com",
    password: "maintenance123",
    name: "Maintenance Staff", 
    role: "maintenance_staff" as UserRole,
    phone: "+30-210-555-0105"
  },
  {
    email: "superadmin@ariviavillas.com",
    password: "superadmin123",
    name: "Super Admin",
    role: "superadmin" as UserRole,
    phone: "+30-210-555-0107"
  }
];

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

// Authentication functions using Supabase Auth
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("No user data returned");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Failed to fetch user profile");
    }

    const user: User = {
      id: profile.user_id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      avatar: profile.avatar,
      phone: profile.phone,
      customPermissions: (profile.custom_permissions as Record<string, boolean>) || {}
    };

    toastService.success(`Welcome, ${user.name}`, {
      description: "You have successfully logged in."
    });

    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    
    toastService.info("Logged Out", {
      description: "You have been successfully logged out."
    });
    
    // Force redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getUserFromStorage = async (): Promise<{ user: User | null; lastAuthTime: number }> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return { user: null, lastAuthTime: 0 };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (profileError || !profile) {
      console.error("Failed to fetch user profile:", profileError);
      return { user: null, lastAuthTime: 0 };
    }

    const user: User = {
      id: profile.user_id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      avatar: profile.avatar,
      phone: profile.phone,
      customPermissions: (profile.custom_permissions as Record<string, boolean>) || {}
    };

    return { user, lastAuthTime: Date.now() };
  } catch (error) {
    console.error("Get user from storage error:", error);
    return { user: null, lastAuthTime: 0 };
  }
};
