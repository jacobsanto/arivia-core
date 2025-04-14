
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

const AuthRedirect: React.FC = () => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading) {
      // Only redirect when loading is complete
      navigate(user ? '/dashboard' : '/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Redirecting to the right place...</p>
    </div>
  );
};

export default AuthRedirect;
