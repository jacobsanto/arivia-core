
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDevMode } from "@/contexts/DevModeContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Access dev mode context safely
  const devMode = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useDevMode();
    } catch {
      // Dev mode context not available
      return null;
    }
  })();

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying authentication...</p>
          {devMode?.isDevMode && (
            <p className="text-xs text-orange-600">Development Mode Active</p>
          )}
        </div>
      </div>
    );
  }

  // If dev mode is active and bypassing auth, allow access
  if (devMode?.isDevMode && devMode.settings.bypassAuth) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
