import { useState, useEffect, useMemo } from "react";

// Set a consistent breakpoint
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with null to prevent hydration mismatch
  const [width, setWidth] = useState<number | null>(null);
  
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width to state
      setWidth(window.innerWidth);
    }
    
    // Set initial width
    handleResize();
    
    // Add event listener with debounce for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };
    
    window.addEventListener("resize", debouncedResize);
    
    // Remove event listener and clear timeout on cleanup
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []); // Empty array ensures this only runs on mount and unmount
  
  // Memoize the result to avoid unnecessary re-renders
  const isMobile = useMemo(() => {
    // Only calculate if width is available
    if (width === null) return false;
    return width < MOBILE_BREAKPOINT;
  }, [width]);

  return isMobile;
}