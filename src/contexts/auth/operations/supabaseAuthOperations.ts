import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/auth/types";
import { toastService } from "@/services/toast";
import { signInSecure } from "@/services/auth/secureAuthService";

export const login = async (
  email: string,
  password: string,
  setUser: (user: User | null) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<void> => {
  try {
    setIsLoading(true);

    // Use secure authentication
    const result = await signInSecure(email, password);
    if (result.error) {
      throw result.error;
    }

    const { data } = result;

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
      
      // Update localStorage with last auth time for offline login capability
      const authTime = Date.now();
      localStorage.setItem("lastAuthTime", authTime.toString());
      setLastAuthTime(authTime);
      localStorage.setItem("user", JSON.stringify(userData)); // Store user in localStorage for offline support
      
      console.log("Supabase authentication successful:", userData.name);
    } else {
      // Handle the case where authentication was successful but no user data returned
      throw new Error("Authentication successful but failed to retrieve user data.");
    }

  } catch (error) {
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
    
    toastService.error("Login failed", {
      description: errorMessage
    });
    
    throw new Error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

export const logout = async () => {
  try {
    await supabase.auth.signOut({ scope: 'local' });
    toastService.success("Logged out successfully");
    
    // Clear ALL relevant auth data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("session");
    localStorage.removeItem("authToken");
    localStorage.removeItem("lastAuthTime");
    
    // Use window.location.href for a full page reload and redirect
    // This ensures all React state is cleared and a fresh login page is shown
    window.location.href = "/login";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    toastService.error("Failed to log out", {
      description: errorMessage
    });
    
    // Even if there's an error, try to redirect to login
    window.location.href = "/login";
  }
};

export const signup = async (
  email: string,
  password: string,
  fullName: string,
  role: UserRole = "property_manager",
  setUser: (user: User | null) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    setIsLoading(true);

    // Check if role is superadmin and one already exists
    if (role === "superadmin") {
      const { data: existingSuperAdmin, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'superadmin')
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingSuperAdmin) {
        throw new Error("Super Admin role is already taken. Only one Super Admin account can be created.");
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName,
          role: role
        }
      }
    });

    if (error) throw error;
    
    toastService.success("Account created successfully", {
      description: "You can now login with your credentials"
    });

    // Update localStorage with last auth time
    const authTime = Date.now();
    localStorage.setItem("lastAuthTime", authTime.toString());
    setLastAuthTime(authTime);
    
    return data;
  } catch (error) {
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
    
    toastService.error("Signup failed", {
      description: errorMessage
    });
    throw error;
  } finally {
    setIsLoading(false);
  }
};
