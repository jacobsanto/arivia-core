
import { useState } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: UseSwipeOptions) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const touchObj = e.targetTouches[0];
    setTouchStart({
      x: touchObj.clientX,
      y: touchObj.clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touchObj = e.targetTouches[0];
    setTouchEnd({
      x: touchObj.clientX,
      y: touchObj.clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (distanceX > threshold && onSwipeLeft) {
        onSwipeLeft();
      }
      if (distanceX < -threshold && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (distanceY > threshold && onSwipeUp) {
        onSwipeUp();
      }
      if (distanceY < -threshold && onSwipeDown) {
        onSwipeDown();
      }
    }

    // Reset
    setTouchEnd(null);
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};
