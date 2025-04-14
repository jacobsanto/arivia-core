
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { toast } from "sonner";

export const login = async (
  email: string,
  password: string,
  setUser: (user: User | null) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    console.log("Login attempt for:", email);
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error from Supabase:", error);
      throw error;
    }

    console.log("Login successful, data:", data);

    // Convert Supabase user to our User format
    if (data.user) {
      const userData: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
        role: data.user.user_metadata?.role || 'property_manager',
        avatar: data.user.user_metadata?.avatar || "/placeholder.svg"
      };
      
      // Important: Update user state immediately after successful auth
      setUser(userData);
      console.log("User state updated:", userData);
    }

    // Update localStorage with last auth time for offline login capability
    const authTime = Date.now();
    localStorage.setItem("lastAuthTime", authTime.toString());
    setLastAuthTime(authTime);
    console.log("Auth time updated:", authTime);

  } catch (error) {
    console.error("Login error:", error);
    toast.error("Login failed", {
      description: error instanceof Error ? error.message : "Invalid credentials"
    });
    throw error;
  } finally {
    setIsLoading(false);
  }
};

export const logout = async () => {
  try {
    console.log("Logging out user");
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    
    // Clear ALL relevant auth data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("session");
    localStorage.removeItem("authToken");
    localStorage.removeItem("lastAuthTime");
    
    // Use window.location.href for a full page reload and redirect
    // This ensures all React state is cleared and a fresh login page is shown
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Failed to log out", {
      description: "Please try again"
    });
    
    // Even if there's an error, try to redirect to login
    window.location.href = "/login";
  }
};

export const signup = async (
  email: string,
  password: string,
  fullName: string,
  setUser: (user: User | null) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    console.log("Signup attempt for:", email);
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName,
          role: "property_manager" // Default role for new signups
        }
      }
    });

    if (error) throw error;

    console.log("Signup successful, data:", data);
    
    toast.success("Account created successfully", {
      description: "You can now login with your credentials"
    });

    // Update localStorage with last auth time
    const authTime = Date.now();
    localStorage.setItem("lastAuthTime", authTime.toString());
    setLastAuthTime(authTime);
    
    return data;
  } catch (error) {
    console.error("Signup error:", error);
    toast.error("Signup failed", {
      description: error instanceof Error ? error.message : "An error occurred during signup"
    });
    throw error;
  } finally {
    setIsLoading(false);
  }
};
