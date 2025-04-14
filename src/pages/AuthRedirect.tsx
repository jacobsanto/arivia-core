
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

const AuthRedirect: React.FC = () => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
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
  
  // These fallbacks should never be reached due to the useEffect above
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default AuthRedirect;
