
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/auth/UserContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  useEffect(() => {
    // Redirect to dashboard if logged in, otherwise to login page
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate, user]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-700">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Loading Arivia Villa Sync</h1>
        <div className="flex justify-center">
          <div className="animate-pulse-subtle w-4 h-4 bg-white rounded-full mx-1"></div>
          <div className="animate-pulse-subtle w-4 h-4 bg-white rounded-full mx-1" style={{ animationDelay: "0.2s" }}></div>
          <div className="animate-pulse-subtle w-4 h-4 bg-white rounded-full mx-1" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
