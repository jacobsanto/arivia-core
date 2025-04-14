
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

const AuthRedirect: React.FC = () => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  console.log("AuthRedirect: user:", user?.id, "isLoading:", isLoading);
  
  useEffect(() => {
    // If we're stuck in a loading state for too long, force navigate to login
    const timeout = setTimeout(() => {
      if (isLoading && redirectAttempts < 2) {
        console.log("Auth redirect timeout - still loading after delay");
        setRedirectAttempts(prev => prev + 1);
      } else if (redirectAttempts >= 2) {
        console.log("Maximum redirect attempts reached, forcing navigation to login");
        navigate('/login');
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isLoading, navigate, redirectAttempts]);
  
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
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking authentication status...</p>
      </div>
    );
  }
  
  // Fallback redirect if the useEffect doesn't trigger navigation
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default AuthRedirect;
