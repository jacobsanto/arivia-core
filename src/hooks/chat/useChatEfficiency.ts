
import { useState, useEffect, useCallback, useRef } from "react";

interface ChatEfficiencyOptions {
  refreshInterval?: number;
  componentId?: string;
}

/**
 * Hook to manage efficient rendering and prevent flickering in chat components
 * 
 * @param options Configuration options for chat efficiency
 * @returns Object with efficiency-related utilities
 */
export function useChatEfficiency(options: ChatEfficiencyOptions = {}) {
  // Set defaults
  const refreshInterval = options.refreshInterval || 10000; // 10 seconds
  const componentId = options.componentId || `chat-${Math.random().toString(36).substring(7)}`;
  
  // Track if we've loaded content at least once
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const loadAttempts = useRef(0);
  const lastRefreshTime = useRef(0);
  const refreshInProgress = useRef(false);
  
  // Debounced refresh function to prevent multiple rapid refreshes
  const debouncedRefresh = useCallback(async (refreshFn: () => Promise<any>) => {
    const now = Date.now();
    
    // Don't allow concurrent refreshes
    if (refreshInProgress.current) {
      console.log(`[${componentId}] Refresh already in progress, skipping`);
      return Promise.resolve(false);
    }
    
    // Only allow refreshes after interval has passed
    if (now - lastRefreshTime.current > refreshInterval) {
      try {
        refreshInProgress.current = true;
        console.log(`[${componentId}] Starting refresh`);
        
        lastRefreshTime.current = now;
        loadAttempts.current = 0;
        
        return await refreshFn();
      } catch (error) {
        console.error(`[${componentId}] Refresh error:`, error);
        return Promise.resolve(false);
      } finally {
        refreshInProgress.current = false;
      }
    } else {
      console.log(`[${componentId}] Refresh throttled - too frequent (${Math.floor((now - lastRefreshTime.current) / 1000)}s elapsed of ${refreshInterval / 1000}s interval)`);
      loadAttempts.current += 1;
      return Promise.resolve(false);
    }
  }, [refreshInterval, componentId]);
  
  // Mark initial load complete
  const markInitialLoadComplete = useCallback(() => {
    if (!hasInitialLoad) {
      console.log(`[${componentId}] Initial load completed`);
      setHasInitialLoad(true);
    }
  }, [hasInitialLoad, componentId]);
  
  // Effect to track render cycles
  useEffect(() => {
    console.log(`[${componentId}] Component rendered`);
    
    return () => {
      console.log(`[${componentId}] Component unmounted`);
    };
  }, [componentId]);
  
  // Reset refresh timer when unmounting
  useEffect(() => {
    return () => {
      refreshInProgress.current = false;
    };
  }, []);
  
  return {
    hasInitialLoad,
    markInitialLoadComplete,
    debouncedRefresh,
    loadAttempts: loadAttempts.current,
    isRefreshing: refreshInProgress.current
  };
}
