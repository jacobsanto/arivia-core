
import { useState, useRef, useCallback } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  pullThreshold?: number;
  maxPull?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  pullThreshold = 60,
  maxPull = 100,
}: UsePullToRefreshProps) => {
  const [pullMoveY, setPullMoveY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const touchIdentifier = useRef<number | null>(null);

  const reset = useCallback(() => {
    startY.current = null;
    touchIdentifier.current = null;
    setPullMoveY(0);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing || touchIdentifier.current !== null) return;

    // Store the identifier of the touch point to track
    touchIdentifier.current = e.changedTouches[0].identifier;
    
    // Only allow pull to refresh when at the top of the content
    if (contentRef.current && contentRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing || startY.current === null || touchIdentifier.current === null) return;

    // Find the touch point with our stored identifier
    let touch;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdentifier.current) {
        touch = e.changedTouches[i];
        break;
      }
    }

    if (!touch) return;

    const currentY = touch.clientY;
    const diffY = currentY - startY.current;

    // Only allow pulling down
    if (diffY > 0 && contentRef.current && contentRef.current.scrollTop === 0) {
      // Apply resistance to make the pull feel natural
      const pullDistance = Math.min(diffY * 0.5, maxPull);
      setPullMoveY(pullDistance);
      
      // Prevent default to stop scrolling
      e.preventDefault();
    }
  }, [isRefreshing, maxPull]);

  const handleTouchEnd = useCallback(() => {
    if (startY.current === null || touchIdentifier.current === null) return;

    // If pulled past threshold, trigger refresh
    if (pullMoveY > pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Call the refresh function
      Promise.resolve(onRefresh()).finally(() => {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullMoveY(0);
        }, 1000); // Give time for animation
      });
    } else {
      // Reset if not pulled enough
      setPullMoveY(0);
    }
    
    // Reset
    startY.current = null;
    touchIdentifier.current = null;
  }, [isRefreshing, onRefresh, pullMoveY, pullThreshold]);

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
