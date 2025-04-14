
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

const AuthRedirect: React.FC = () => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  
  console.log("AuthRedirect: user:", user?.id, "isLoading:", isLoading);
  
  useEffect(() => {
    if (user && !isLoading) {
      console.log("User authenticated, redirecting to dashboard");
      navigate('/dashboard');
    } else if (!isLoading && !user) {
      console.log("User not authenticated, redirecting to login");
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return null;
};

export default AuthRedirect;
