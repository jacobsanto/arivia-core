
import { useState, useEffect, useMemo } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with undefined to prevent hydration mismatch
  const [width, setWidth] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width to state
      setWidth(window.innerWidth);
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Initial setup
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures this only runs on mount and unmount
  
  // Memoize the result to avoid unnecessary re-renders
  const isMobile = useMemo(() => {
    // Only calculate if width is defined
    if (width === undefined) return false;
    return width < MOBILE_BREAKPOINT;
  }, [width]);

  return isMobile;
}
