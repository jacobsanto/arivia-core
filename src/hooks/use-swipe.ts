
import { useState, useRef, TouchEvent } from 'react';

interface SwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeProgress?: (direction: 'left' | 'right' | 'up' | 'down', progress: number) => void;
}

export function useSwipe({
  threshold = 50,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipeProgress
}: SwipeOptions = {}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    touchEnd.current = null; // Reset touchEnd
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    setSwiping(true);
    setSwipeDirection(null);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!touchStart.current) return;
    
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    
    // Calculate progress for dynamic feedback
    if (onSwipeProgress && touchStart.current && touchEnd.current) {
      const deltaX = touchEnd.current.x - touchStart.current.x;
      const deltaY = touchEnd.current.y - touchStart.current.y;
      
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      
      if (isHorizontalSwipe) {
        const direction = deltaX > 0 ? 'right' : 'left';
        const progress = Math.min(Math.abs(deltaX) / threshold, 1);
        onSwipeProgress(direction, progress);
        setSwipeDirection(direction);
      } else {
        const direction = deltaY > 0 ? 'down' : 'up';
        const progress = Math.min(Math.abs(deltaY) / threshold, 1);
        onSwipeProgress(direction, progress);
        setSwipeDirection(direction);
      }
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current || !touchEnd.current) return;
    
    setSwiping(false);
    
    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    
    if (isHorizontalSwipe) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      if (deltaY > threshold && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < -threshold && onSwipeUp) {
        onSwipeUp();
      }
    }
    
    // Reset after processing
    touchStart.current = null;
    touchEnd.current = null;
    setSwipeDirection(null);
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    swiping,
    swipeDirection
  };
}
