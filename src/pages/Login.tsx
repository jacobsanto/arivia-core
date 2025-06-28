
import React, { useState, useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLogin from "@/components/auth/MobileLogin";
import { useUser } from "@/contexts/UserContext";
import { getRoleBasedRoute } from "@/lib/utils/routing";
import { safeRoleCast } from "@/types/auth/base";

const Login = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAuthenticated, isLoading, user } = useUser();

  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      const userRole = safeRoleCast(user.role);
      const redirectPath = getRoleBasedRoute(userRole);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

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

          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-1">Internal Access</h2>
            <p className="text-gray-500 mb-6">Login with your staff credentials</p>
            <LoginForm />
          </div>
        </div>
      </div>
      
      <div className="hidden lg:flex lg:flex-1 lg:bg-gradient-to-br lg:from-primary lg:to-blue-700">
        <div className="flex flex-col justify-center p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">Welcome to Arivia Villas</h2>
          <p className="text-lg mb-4">Internal operations management system</p>
          <ul className="space-y-2">
            <li>• Property management</li>
            <li>• Task coordination</li>
            <li>• Inventory tracking</li>
            <li>• Team collaboration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
