
import { useAuthState } from "./auth/useAuthState";
import { useUserData } from "./users/useUserData";
import { useSessionSync } from "./auth/useSessionSync";
import { useAuth } from "@/auth";

// Refactored hook to avoid duplicate subscriptions and ensure consistent typing
export const useUserState = () => {
  // Use the centralized auth state
  const centralAuth = useAuth(); 
  
  // Get auth state (session, online status, etc)
  const authState = useAuthState();
  
  // Get user data management with combined functionality
  const userData = useUserData();
  
  // Use session sync hook to tie everything together but with reduced responsibility
  // since we're now using the central AuthContext
  useSessionSync(
    userData.setUser,
    authState.setSession,
    authState.setLastAuthTime,
    authState.setIsLoading,
    userData.fetchProfileData
  );
  
  // Return the combined state and functions
  return {
    ...authState,
    ...userData,
    // Use data from central auth state when available
    user: centralAuth.user || userData.user,
    session: centralAuth.session || authState.session,
    isLoading: centralAuth.isLoading || authState.isLoading,
    refreshUserProfile: userData.refreshUserProfile
  };
};
