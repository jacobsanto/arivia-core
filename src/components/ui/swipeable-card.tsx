
import React from "react";
import { Card } from "@/components/ui/card";
import { useSwipe } from "@/hooks/use-swipe";
import { cn } from "@/lib/utils";

interface SwipeableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  swipeEnabled?: boolean;
  feedbackColor?: string;
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
  ...props
}, ref) => {
  const [swipeDirection, setSwipeDirection] = React.useState<string | null>(null);

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

  // Dynamic background based on swipe direction for visual feedback
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
    onTouchMove,
    onTouchEnd
  } : {};

  return (
    <Card
      ref={ref}
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
  );
});

SwipeableCard.displayName = "SwipeableCard";

export { SwipeableCard };
