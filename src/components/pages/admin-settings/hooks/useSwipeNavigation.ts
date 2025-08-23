/**
 * Hook for mobile swipe navigation
 */
import { useSwipe } from '@/hooks/use-swipe';
import { useIsMobile } from '@/hooks/use-mobile';
import type { NavigateFunction } from 'react-router-dom';

export const useSwipeNavigation = (navigate: NavigateFunction) => {
  const isMobile = useIsMobile();
  
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeRight: () => {
      if (isMobile) {
        navigate(-1);
      }
    }
  });
  
  return isMobile ? {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } : {};
};