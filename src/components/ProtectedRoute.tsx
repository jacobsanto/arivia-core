import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, error } = useAuth();

  console.log('[ProtectedRoute] State:', { hasUser: !!user, isLoading, hasError: !!error });

  // Show loading state only during initial auth check when no user is set
  if (isLoading && !user) {
    console.log('[ProtectedRoute] Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an auth error
  if (error) {
    console.log('[ProtectedRoute] Showing error state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <p className="text-destructive font-semibold">Authentication Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Navigate to="/login" replace />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;