
import React, { useState, useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLogin from "@/components/auth/MobileLogin";
import { LoginInfoPanel } from "@/components/auth/LoginInfoPanel";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isAuthenticated, isLoading, error } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Get the intended destination or default to dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If already authenticated, don't show login form
  if (isAuthenticated) {
    return null;
  }

  // Show any authentication errors
  const authError = location.state?.error || error;

  if (isMobile) {
    return <MobileLogin />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/c71ac675-b13f-4479-a62a-758f193152c2.png" 
              alt="Arivia Logo" 
              className="h-24 w-auto object-contain"
            />
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                Authentication error. Please try logging in again.
              </p>
            </div>
          )}

          <div className="flex mb-6 border-b">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 py-3 text-center ${
                activeTab === "signin" 
                  ? "font-medium border-b-2 border-primary" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 text-center ${
                activeTab === "signup" 
                  ? "font-medium border-b-2 border-primary" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          <div className="mt-6">
            {activeTab === "signin" ? (
              <div>
                <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
                <p className="text-gray-500 mb-6">Login to your account to continue</p>
                <LoginForm />
                <div className="mt-4 text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("signup")}
                    className="text-primary hover:underline"
                  >
                    Register
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-1">Create account</h2>
                <p className="text-gray-500 mb-6">Register to start managing your properties</p>
                <SignUpForm />
                <div className="mt-4 text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("signin")}
                    className="text-primary hover:underline"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <LoginInfoPanel />
    </div>
  );
};

export default Login;
