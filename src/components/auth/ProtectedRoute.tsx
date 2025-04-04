
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles = [] }) => {
  const { user, isLoading, hasPermission } = useUser();
  const location = useLocation();

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role check is required and user doesn't have permission
  if (allowedRoles.length > 0 && !hasPermission(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
