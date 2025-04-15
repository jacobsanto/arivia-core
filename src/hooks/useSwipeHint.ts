
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

/**
 * A hook that manages the hint indicator for swipe gestures
 * Shows a hint to users about swipe gestures and tracks whether they have been seen
 */
export const useSwipeHint = () => {
  const isMobile = useIsMobile();
  const [showSwipeHint, setShowSwipeHint] = useState<boolean>(true);
  
  // Check local storage on first render
  useEffect(() => {
    const hasSeenSwipeHint = localStorage.getItem('seen_swipe_hint') === 'true';
    if (hasSeenSwipeHint) {
      setShowSwipeHint(false);
    }
  }, []);
  
  // Function to reset the hint (hide it and save to localStorage)
  const resetSwipeHint = () => {
    setShowSwipeHint(false);
    localStorage.setItem('seen_swipe_hint', 'true');
  };
  
  return {
    showSwipeHint,
    isMobile,
    resetSwipeHint
  };
};
