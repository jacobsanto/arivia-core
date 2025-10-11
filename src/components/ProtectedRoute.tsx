import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Open access - no authentication required
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Always allow access - app is in open mode for development
  return <>{children}</>;
};

export default ProtectedRoute;