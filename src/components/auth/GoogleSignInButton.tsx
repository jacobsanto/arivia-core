
import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { handleGoogleLogin } from "@/services/auth/googleAuthService";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "@/contexts/auth/UserContext";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
}

const GoogleSignInButton = ({ 
  onSuccess, 
  isLoading = false,
  setIsLoading
}: GoogleSignInButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useUser();
  
  const handleSuccess = async (credentialResponse: any) => {
    if (setIsLoading) setIsLoading(true);
    
    try {
      const user = await handleGoogleLogin(credentialResponse.credential);
      await loginWithGoogle(user);
      
      // Get the redirect path from location state or default to "/"
      const from = location.state?.from?.pathname || "/";
      navigate(from);
      
      toast.success("Google login successful", {
        description: "Welcome to Arivia Villa Sync",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed", {
        description: "Unable to authenticate with Google",
      });
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error("Google OAuth error occurred");
    toast.error("Google login failed", {
      description: "There was an error authenticating with Google. Please make sure your Google Cloud Console project is configured correctly.",
    });
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false} // Disable One Tap to avoid potential issues
        theme="outline"
        size="large"
        shape="rectangular"
        text="signin_with"
        width="100%" // The Google SDK might complain about this, but it's the most responsive option
        locale="en" // Ensure English language to avoid translation issues
      />
      <div className="mt-2 text-xs text-center text-gray-500">
        Developer: Replace "YOUR_GOOGLE_CLIENT_ID" in App.tsx with your actual Google Client ID
      </div>
    </div>
  );
};

export default GoogleSignInButton;
