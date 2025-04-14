
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

const MainLayout = () => {
  const { user, isLoading } = useUser();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If authenticated and trying to access auth pages, redirect to dashboard
  if (user && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

export default MainLayout;
