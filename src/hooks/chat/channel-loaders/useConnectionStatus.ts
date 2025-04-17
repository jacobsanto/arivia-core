
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    async function checkConnection() {
      if (!user) return;
      
      try {
        // Use a simple ping to check connection
        const { data, error } = await supabase.from('chat_channels').select('count').limit(1);
        if (error) throw error;
        setIsConnected(true);
        setLoadError(null);
      } catch (connectionError) {
        console.warn("Connection error:", connectionError);
        setIsConnected(false);
        setLoadError("Connection to server failed. Using offline mode.");
      }
    }
    
    checkConnection();
    
    // Set up an interval to check connection every minute
    const intervalId = setInterval(() => {
      if (user) {
        checkConnection();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  return { isConnected, loadError, setLoadError };
}
