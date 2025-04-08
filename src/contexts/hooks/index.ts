
import { useAuthState } from "./auth/useAuthState";
import { useUserData } from "./users/useUserData";
import { useProfileSync } from "./profile/useProfileSync";
import { useSessionSync } from "./auth/useSessionSync";
import { useState, useEffect } from "react";

// Re-export the new refactored hook as useUserState for backwards compatibility
export const useUserState = () => {
  // Get auth state (session, online status, etc)
  const authState = useAuthState();
  
  // Get user data management
  const userData = useUserData();
  
  // Get profile sync functions
  const { fetchProfileData, refreshUserProfile } = useProfileSync(
    userData.user,
    userData.setUser
  );
  
  // Use session sync hook to tie everything together
  useSessionSync(
    userData.setUser,
    authState.setSession,
    authState.setLastAuthTime,
    authState.setIsLoading,
    fetchProfileData
  );
  
  // Return the combined state and functions
  return {
    ...authState,
    ...userData,
    refreshUserProfile
  };
};
