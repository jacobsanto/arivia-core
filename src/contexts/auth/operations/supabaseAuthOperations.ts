
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
