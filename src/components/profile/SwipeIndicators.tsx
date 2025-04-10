
import React from "react";
import { SwipeIndicator } from "@/components/ui/swipe-indicator";

interface SwipeIndicatorsProps {
  hasPrevTab: boolean;
  hasNextTab: boolean;
  showSwipeHint: boolean;
}

const SwipeIndicators: React.FC<SwipeIndicatorsProps> = ({
  hasPrevTab,
  hasNextTab,
  showSwipeHint
}) => {
  return (
    <>
      {hasPrevTab && (
        <SwipeIndicator 
          direction="right" 
          visible={showSwipeHint}
          className="top-1/2 -translate-y-1/2" 
        />
      )}
      {hasNextTab && (
        <SwipeIndicator 
          direction="left" 
          visible={showSwipeHint}
          className="top-1/2 -translate-y-1/2" 
        />
      )}
    </>
  );
};

export default SwipeIndicators;
