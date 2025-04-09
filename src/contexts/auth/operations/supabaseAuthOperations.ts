import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast/toast.service";
import { User, UserRole } from "@/types/auth";
import { 
  loginUser as mockLoginUser,
  logoutUser as mockLogoutUser
} from "@/services/auth/userAuthService";

// Login function that tries Supabase first, then falls back to mock auth
export const login = async (
  email: string, 
  password: string,
  setUser: (user: User) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  try {
    // Try Supabase authentication first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Success! Session is handled by onAuthStateChange
    toastService.success(`Welcome back!`, {
      description: "You have successfully logged in."
    });
    
    return;
  } catch (supaError) {
    console.error("Supabase login error:", supaError);
    
    try {
      // Fall back to mock authentication for development
      const loggedInUser = await mockLoginUser(email, password);
      setUser(loggedInUser);
      setLastAuthTime(Date.now());
    } catch (error) {
      toastService.error("Login Failed", {
        description: (error as Error).message
      });
      throw error;
    }
  } finally {
    setIsLoading(false);
  }
};

// Logout function that signs out from Supabase and cleans up local storage
export const logout = async () => {
  // Supabase signout
  await supabase.auth.signOut();
  
  // Local cleanup
  mockLogoutUser();
};

export const signup = async (
  email: string, 
  password: string, 
  fullName: string,
  setUser: (user: any) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  try {
    // For now, let's use the same mock authentication as the login function
    // In a real implementation, this would create a new user
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    const userData = {
      id: Date.now().toString(),
      email,
      name: fullName,
      role: 'property_manager' as const,
      avatar: "/placeholder.svg"
    };
    
    // Save the new user to localStorage (simplified for demo)
    const existingUsers = localStorage.getItem("users");
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    users.push(userData);
    localStorage.setItem("users", JSON.stringify(users));
    
    // Set the user in state
    setUser(userData);
    
    // Update last auth time
    const currentTime = Date.now();
    setLastAuthTime(currentTime);
    localStorage.setItem("lastAuthTime", currentTime.toString());
    
    // Store the user in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};
