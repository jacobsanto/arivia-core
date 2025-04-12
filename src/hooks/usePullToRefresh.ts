
import { useState, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PullToRefreshProps {
  onRefresh: () => void;
  threshold?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 60 }: PullToRefreshProps) => {
  const [pullStartY, setPullStartY] = useState(0);
  const [pullMoveY, setPullMoveY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const onTouchStart = (e: React.TouchEvent) => {
    if (isMobile && contentRef.current) {
      // Only enable pull-to-refresh when at the top of the content
      if (contentRef.current.scrollTop <= 0) {
        setPullStartY(e.touches[0].clientY);
        setPullMoveY(0);
      }
    }
    return e;
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (isMobile && pullStartY > 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStartY;
      
      // Only allow pulling down, not up
      if (diff > 0) {
        // Resist the pull with a dampening factor
        const dampening = 0.4;
        setPullMoveY(diff * dampening);
        
        // Prevent default to disable scrolling while pulling
        if (diff > 30) {
          e.preventDefault();
        }
      }
    }
    return e;
  };
  
  const onTouchEnd = () => {
    // If pulled enough, trigger refresh
    if (pullMoveY > threshold) {
      refreshData();
    }
    
    // Reset pull values
    setPullStartY(0);
    setPullMoveY(0);
  };
  
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Call the provided refresh function
    onRefresh();
    
    // Reset refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  return { 
    pullMoveY, 
    isRefreshing, 
    contentRef,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd
    }
  };
};
