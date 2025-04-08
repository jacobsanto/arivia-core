
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
      toast.error("Google login failed", {
        description: "Unable to authenticate with Google",
      });
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          toast.error("Google login failed", {
            description: "There was an error authenticating with Google",
          });
        }}
        useOneTap
        theme="outline"
        size="large"
        shape="rectangular"
        text="signin_with"
        width="100%"
      />
    </div>
  );
};

export default GoogleSignInButton;
