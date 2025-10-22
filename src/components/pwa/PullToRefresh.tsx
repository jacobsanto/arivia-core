import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh when at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setCanRefresh(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canRefresh || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      // Only pull down (positive distance) and when at top
      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        // Add resistance to the pull
        const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
        setPullDistance(resistedDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!canRefresh) return;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      setCanRefresh(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canRefresh, isRefreshing, pullDistance, threshold, onRefresh]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div ref={containerRef} className="relative">
      {showIndicator && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 transition-opacity"
          style={{
            opacity: isRefreshing ? 1 : Math.min(pullDistance / threshold, 1),
            transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
          }}
        >
          <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm px-4 py-2 shadow-lg border">
            <RefreshCw
              className={`h-4 w-4 text-primary ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: `rotate(${progress * 3.6}deg)`,
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing
                ? 'Refreshing...'
                : pullDistance >= threshold
                ? 'Release to refresh'
                : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
