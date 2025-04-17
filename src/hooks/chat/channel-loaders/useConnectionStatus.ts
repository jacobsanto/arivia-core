
import { useState, useEffect } from "react";

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Check initial connection status
  useEffect(() => {
    const checkConnection = () => {
      if (navigator.onLine) {
        setIsConnected(true);
        setLoadError(null);
      } else {
        setIsConnected(false);
        setLoadError("You are currently offline. Please check your internet connection.");
      }
    };
    
    // Check immediately
    checkConnection();
    
    // Listen for changes in connection status
    window.addEventListener('online', () => {
      setIsConnected(true);
      setLoadError(null);
    });
    
    window.addEventListener('offline', () => {
      setIsConnected(false);
      setLoadError("You are currently offline. Please check your internet connection.");
    });
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);
  
  return { isConnected, loadError, setLoadError };
}
