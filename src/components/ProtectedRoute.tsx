
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { UserRole, safeRoleCast } from '@/types/auth/base';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/internal/login" replace />;
  }

  // Use safeRoleCast to handle string to UserRole conversion
  const userRole = safeRoleCast(user.role);
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
