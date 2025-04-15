
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export interface UseSwipeHintReturn {
  showSwipeHint: boolean;
  isMobile: boolean;
  resetSwipeHint: () => void;
}

export const useSwipeHint = (): UseSwipeHintReturn => {
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (showSwipeHint && isMobile) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint, isMobile]);

  const resetSwipeHint = () => {
    setShowSwipeHint(false);
  };

  return {
    showSwipeHint,
    isMobile,
    resetSwipeHint
  };
};
