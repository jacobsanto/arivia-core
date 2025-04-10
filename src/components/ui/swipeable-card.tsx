import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useSwipe } from "@/hooks/use-swipe";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SwipeableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  swipeEnabled?: boolean;
  feedbackColor?: string;
  swipeIndicators?: boolean;
  swipeLeftText?: string;
  swipeRightText?: string;
}

const SwipeableCard = React.forwardRef<
  HTMLDivElement,
  SwipeableCardProps
>(({
  className,
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  swipeEnabled = true,
  feedbackColor = "rgba(0, 0, 0, 0.1)",
  swipeIndicators = false,
  swipeLeftText = "Delete",
  swipeRightText = "Complete",
  ...props
}, ref) => {
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [swipeAmount, setSwipeAmount] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!swipeDirection) {
      const timer = setTimeout(() => setSwipeAmount(0), 300);
      return () => clearTimeout(timer);
    }
  }, [swipeDirection]);

  const { onTouchStart, onTouchMove, onTouchEnd, swiping } = useSwipe({
    threshold: swipeThreshold,
    onSwipeLeft: () => {
      setSwipeDirection("left");
      if (onSwipeLeft) onSwipeLeft();
      setTimeout(() => setSwipeDirection(null), 300);
    },
    onSwipeRight: () => {
      setSwipeDirection("right");
      if (onSwipeRight) onSwipeRight();
      setTimeout(() => setSwipeDirection(null), 300);
    },
    onSwipeUp: () => {
      setSwipeDirection("up");
      if (onSwipeUp) onSwipeUp();
      setTimeout(() => setSwipeDirection(null), 300);
    },
    onSwipeDown: () => {
      setSwipeDirection("down");
      if (onSwipeDown) onSwipeDown();
      setTimeout(() => setSwipeDirection(null), 300);
    }
  });

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeEnabled || !cardRef.current) return;
    
    const touchX = e.touches[0].clientX;
    const cardRect = cardRef.current.getBoundingClientRect();
    const startX = cardRect.left;
    const deltaX = touchX - startX - (cardRect.width / 2);
    
    const maxSwipe = cardRect.width * 0.3;
    const limitedDelta = Math.max(Math.min(deltaX, maxSwipe), -maxSwipe);
    
    setSwipeAmount(limitedDelta);
    onTouchMove(e);
  };

  const getBackgroundStyle = () => {
    if (!swipeDirection || !swiping) return {};
    
    const gradientStyles = {
      left: `linear-gradient(to left, transparent, ${feedbackColor})`,
      right: `linear-gradient(to right, transparent, ${feedbackColor})`,
      up: `linear-gradient(to top, transparent, ${feedbackColor})`,
      down: `linear-gradient(to bottom, transparent, ${feedbackColor})`
    };
    
    return {
      background: gradientStyles[swipeDirection as keyof typeof gradientStyles]
    };
  };

  const gestureProps = swipeEnabled ? {
    onTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd
  } : {};

  return (
    <div className="relative" ref={ref}>
      {swipeIndicators && swipeEnabled && (
        <>
          <div 
            className={cn(
              "absolute left-0 top-0 bottom-0 flex items-center justify-center opacity-0 bg-red-500/20 text-white font-medium px-4 transition-opacity",
              swipeAmount < -20 && "opacity-100"
            )}
            style={{ width: '80px' }}
          >
            {swipeLeftText}
          </div>
          <div 
            className={cn(
              "absolute right-0 top-0 bottom-0 flex items-center justify-center opacity-0 bg-green-500/20 text-white font-medium px-4 transition-opacity",
              swipeAmount > 20 && "opacity-100"
            )}
            style={{ width: '80px' }}
          >
            {swipeRightText}
          </div>
        </>
      )}
      
      <div 
        style={{
          transform: `translateX(${swipeAmount}px)`,
          transition: swipeAmount === 0 ? 'transform 0.3s ease' : 'none'
        }}
      >
        <Card
          ref={cardRef}
          className={cn(
            "transition-all duration-200",
            swiping && "cursor-grabbing",
            className
          )}
          style={getBackgroundStyle()}
          {...gestureProps}
          {...props}
        >
          {children}
        </Card>
      </div>
    </div>
  );
});

SwipeableCard.displayName = "SwipeableCard";

export { SwipeableCard };
