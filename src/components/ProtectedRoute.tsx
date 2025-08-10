
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

  // Temporary debug log in dev mode
  if (devMode?.isDevMode) {
    // eslint-disable-next-line no-console
    console.debug('ProtectedRoute', {
      path: location.pathname,
      isLoading,
      isAuthenticated,
      bypassAuth: devMode.settings.bypassAuth,
    });
  }

  // Dev bypass first for smooth DX
  if (devMode?.isDevMode && devMode.settings.bypassAuth) {
    return <>{children}</>;
  }

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
