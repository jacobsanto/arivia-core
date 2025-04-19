
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to manage efficient rendering and prevent flickering in chat components
 */
export function useChatEfficiency() {
  // Track if we've loaded content at least once
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const loadAttempts = useRef(0);
  const lastRefreshTime = useRef(0);
  
  // Debounced refresh function to prevent multiple rapid refreshes
  const debouncedRefresh = useCallback((refreshFn: () => Promise<any>) => {
    const now = Date.now();
    // Only allow refreshes every 10 seconds
    if (now - lastRefreshTime.current > 10000) {
      lastRefreshTime.current = now;
      loadAttempts.current = 0;
      return refreshFn();
    } else {
      console.log("Refresh throttled - too many requests");
      loadAttempts.current += 1;
      return Promise.resolve(false);
    }
  }, []);
  
  // Mark initial load complete
  const markInitialLoadComplete = useCallback(() => {
    if (!hasInitialLoad) {
      setHasInitialLoad(true);
    }
  }, [hasInitialLoad]);
  
  // Effect to track render cycles
  useEffect(() => {
    const componentId = `chat-${Math.random().toString(36).substring(7)}`;
    console.log(`[${componentId}] Component rendered`);
    
    return () => {
      console.log(`[${componentId}] Component unmounted`);
    };
  }, []);
  
  return {
    hasInitialLoad,
    markInitialLoadComplete,
    debouncedRefresh,
    loadAttempts: loadAttempts.current
  };
}
