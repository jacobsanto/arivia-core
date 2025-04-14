
import { useAuthState } from "./auth/useAuthState";
import { useUserData } from "./users/useUserData";
import { useSessionSync } from "./auth/useSessionSync";
import { useState } from "react";

// Refactored hook to avoid duplicate subscriptions
export const useUserState = () => {
  // Get auth state (session, online status, etc)
  const authState = useAuthState();
  
  // Get user data management with combined functionality
  const userData = useUserData();
  
  // Use session sync hook to tie everything together
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
    refreshUserProfile: userData.refreshUserProfile
  };
};
