
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useSwipe } from "@/hooks/use-swipe";
import { cn } from "@/lib/utils";

export interface SwipeableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeEnabled?: boolean;
  feedbackColor?: string;
  swipeThreshold?: number;
  swipeIndicators?: boolean;
  swipeLeftText?: string;
  swipeRightText?: string;
  children: React.ReactNode;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  onSwipeLeft,
  onSwipeRight,
  swipeEnabled = true,
  feedbackColor = "rgba(0, 0, 0, 0.05)",
  swipeThreshold = 80,
  swipeIndicators = false,
  swipeLeftText = "Delete",
  swipeRightText = "Complete",
  className,
  children,
  ...props
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeEnabled) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeEnabled || !isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!swipeEnabled) return;
    
    if (swipeOffset > swipeThreshold && onSwipeRight) {
      onSwipeRight();
    } else if (swipeOffset < -swipeThreshold && onSwipeLeft) {
      onSwipeLeft();
    }
    
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  // Use the useSwipe hook for additional swipe handling if needed
  const swipeHandlers = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    threshold: swipeThreshold
  });

  const cardStyle = {
    transform: swipeEnabled ? `translateX(${swipeOffset}px)` : undefined,
    transition: isSwiping ? 'none' : 'transform 0.2s ease',
    backgroundColor: swipeOffset !== 0 ? feedbackColor : undefined
  };

  return (
    <Card
      className={cn("touch-manipulation", className)}
      style={cardStyle}
      onTouchStart={(e) => {
        handleTouchStart(e);
        swipeHandlers.onTouchStart(e);
      }}
      onTouchMove={(e) => {
        handleTouchMove(e);
        swipeHandlers.onTouchMove(e);
      }}
      onTouchEnd={() => {
        handleTouchEnd();
        swipeHandlers.onTouchEnd();
      }}
      {...props}
    >
      {children}
    </Card>
  );
};
