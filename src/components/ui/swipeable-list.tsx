
import React from "react";
import { cn } from "@/lib/utils";
import { SwipeableCard } from "./swipeable-card";

interface SwipeableListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  keyExtractor: (item: any, index: number) => string;
  onSwipeLeft?: (item: any, index: number) => void;
  onSwipeRight?: (item: any, index: number) => void;
  swipeLeftText?: string;
  swipeRightText?: string;
  showIndicators?: boolean;
  className?: string;
}

const SwipeableList = ({
  items,
  renderItem,
  keyExtractor,
  onSwipeLeft,
  onSwipeRight,
  swipeLeftText = "Delete",
  swipeRightText = "Complete",
  showIndicators = true,
  className,
  ...props
}: SwipeableListProps) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {items.map((item, index) => (
        <SwipeableCard
          key={keyExtractor(item, index)}
          onSwipeLeft={onSwipeLeft ? () => onSwipeLeft(item, index) : undefined}
          onSwipeRight={onSwipeRight ? () => onSwipeRight(item, index) : undefined}
          swipeIndicators={showIndicators}
          swipeLeftText={swipeLeftText}
          swipeRightText={swipeRightText}
          className="mb-2"
        >
          {renderItem(item, index)}
        </SwipeableCard>
      ))}
    </div>
  );
};

export { SwipeableList };
