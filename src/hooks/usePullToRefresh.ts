
import { useState, useRef, useEffect } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  pullThreshold?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  pullThreshold = 60
}: UsePullToRefreshOptions) => {
  const [pullMoveY, setPullMoveY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull to refresh when at the top of the content
    if (contentRef.current && contentRef.current.scrollTop <= 0) {
      setStartY(e.touches[0].clientY);
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    // Calculate drag distance
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    // Only allow pulling down, not up
    if (diff > 0) {
      // Apply resistance to make the pull feel natural
      const resistance = 0.4;
      const moveY = diff * resistance;
      setPullMoveY(moveY);
      
      // Prevent default scrolling behavior when pulling down
      if (moveY > 0) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    
    // If pulled enough, trigger refresh
    if (pullMoveY > pullThreshold) {
      setIsRefreshing(true);
      
      // Execute refresh callback
      Promise.resolve(onRefresh())
        .finally(() => {
          // Reset after a minimum delay to show the refresh animation
          setTimeout(() => {
            setIsRefreshing(false);
            setPullMoveY(0);
          }, 1000);
        });
    } else {
      // Not pulled enough, reset
      setPullMoveY(0);
    }
    
    isDraggingRef.current = false;
  };

  return {
    pullMoveY,
    isRefreshing,
    contentRef,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};
