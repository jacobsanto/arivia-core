
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const useSwipeHint = () => {
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Only show swipe hint on mobile devices
    if (isMobile) {
      // Check if the user has seen the swipe hint before
      const hasSeenSwipeHint = localStorage.getItem('hasSeenSwipeHint');
      
      if (!hasSeenSwipeHint) {
        // Show the swipe hint after a short delay
        const timer = setTimeout(() => {
          setShowSwipeHint(true);
          // Hide the swipe hint after 3 seconds
          setTimeout(() => {
            setShowSwipeHint(false);
            // Save that the user has seen the swipe hint
            localStorage.setItem('hasSeenSwipeHint', 'true');
          }, 3000);
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isMobile]);
  
  const resetSwipeHint = () => {
    setShowSwipeHint(false);
  };
  
  return { showSwipeHint, isMobile, resetSwipeHint };
};
