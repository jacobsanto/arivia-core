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
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Update localStorage with last auth time for offline login capability
    const authTime = Date.now();
    localStorage.setItem("lastAuthTime", authTime.toString());
    setLastAuthTime(authTime);

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
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    
    // Clear user data from localStorage but keep other settings
    localStorage.removeItem("user");
    localStorage.removeItem("session");
    
    // Redirect to login page
    window.location.href = "/auth/login";
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Failed to log out", {
      description: "Please try again"
    });
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
