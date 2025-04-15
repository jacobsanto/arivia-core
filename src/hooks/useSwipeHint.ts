
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export const useSwipeHint = () => {
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const isMobile = useIsMobile();
  
  // Check if the user has already seen the swipe hint
  useEffect(() => {
    const hasSeenSwipeHint = localStorage.getItem('seen_swipe_hint');
    
    // If they haven't seen it and are on mobile, show the hint
    if (!hasSeenSwipeHint && isMobile) {
      setShowSwipeHint(true);
      
      // Hide hint after a delay
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem('seen_swipe_hint', 'true');
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setShowSwipeHint(false);
    }
  }, [isMobile]);
  
  // Function to reset and show the hint again
  const resetSwipeHint = () => {
    setShowSwipeHint(false);
  };
  
  return { showSwipeHint, isMobile, resetSwipeHint };
};
