import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { toast } from "sonner";

export const login = async (
  email: string,
  password: string,
  setUser: (user: User | null) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<void> => {
  try {
    console.log(`Login operation started for: ${email} (${Date.now()})`);
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
      
      // Update localStorage with last auth time for offline login capability
      const authTime = Date.now();
      localStorage.setItem("lastAuthTime", authTime.toString());
      setLastAuthTime(authTime);
      localStorage.setItem("user", JSON.stringify(userData)); // Store user in localStorage for offline support
      console.log("Auth time updated:", authTime);
    } else {
      // Handle the case where authentication was successful but no user data returned
      console.error("Authentication successful but no user data returned");
      throw new Error("Authentication successful but failed to retrieve user data.");
    }

  } catch (error) {
    console.error("Login error:", error);
    let errorMessage = error instanceof Error ? error.message : "Invalid credentials";
    
    // Better error messages
    if (error instanceof Error) {
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email address before logging in.";
      }
    }
    
    toast.error("Login failed", {
      description: errorMessage
    });
    
    throw new Error(errorMessage);
  } finally {
    setIsLoading(false);
    console.log(`Login operation finished for: ${email} (${Date.now()})`);
  }
};

export const logout = async () => {
  try {
    console.log("Logging out user");
    await supabase.auth.signOut({ scope: 'local' });
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
    let errorMessage = "An error occurred during signup";
    
    if (error instanceof Error) {
      if (error.message.includes("already registered")) {
        errorMessage = "This email is already registered. Please log in instead.";
      } else if (error.message.includes("password")) {
        errorMessage = "Password must be at least 6 characters long";
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error("Signup failed", {
      description: errorMessage
    });
    throw error;
  } finally {
    setIsLoading(false);
  }
};
