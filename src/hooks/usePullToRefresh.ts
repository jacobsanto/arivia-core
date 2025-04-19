
import { useState, useRef, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh?: () => void | Promise<void>;
  pullDistance?: number;
  maxPullDistance?: number;
}

interface PullToRefreshResult {
  pullMoveY: number;
  isRefreshing: boolean;
  contentRef: React.RefObject<HTMLDivElement>;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export const usePullToRefresh = (options?: PullToRefreshOptions): PullToRefreshResult => {
  const {
    onRefresh,
    pullDistance = 60,
    maxPullDistance = 100
  } = options || {};
  
  const [pullMoveY, setPullMoveY] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const initialScrollTop = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    if (contentRef.current) {
      initialScrollTop.current = contentRef.current.scrollTop;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    
    const touchY = e.touches[0].clientY;
    const touchDiff = touchY - touchStartY.current;
    
    // Only allow pull-to-refresh when scrolled to top
    if (contentRef.current && contentRef.current.scrollTop <= 0 && touchDiff > 0) {
      // Apply resistance factor for natural feel
      const resistance = 0.4;
      setPullMoveY(Math.min(touchDiff * resistance, maxPullDistance));
      if (e.cancelable) e.preventDefault();
    }
  }, [isRefreshing, maxPullDistance]);

  const handleTouchEnd = useCallback(() => {
    if (pullMoveY > pullDistance && !isRefreshing && onRefresh) {
      setIsRefreshing(true);
      
      // Execute refresh function
      Promise.resolve(onRefresh())
        .finally(() => {
          // Add slight delay for better UX
          setTimeout(() => {
            setIsRefreshing(false);
            setPullMoveY(0);
          }, 1000);
        });
    } else {
      // Add a smooth spring-back animation
      setPullMoveY(0);
    }
  }, [pullMoveY, isRefreshing, onRefresh, pullDistance]);

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
