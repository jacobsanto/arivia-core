
import { useState, useEffect } from "react";
import { Session } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastAuthTime, setLastAuthTime] = useState<number>(0);

  // Set up online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return {
    session,
    setSession,
    isLoading,
    setIsLoading,
    isOffline,
    lastAuthTime,
    setLastAuthTime
  };
};
