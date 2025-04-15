
import React from 'react';
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
  if (!showSwipeHint) return null;
  
  return (
    <>
      {hasPrevTab && (
        <SwipeIndicator 
          direction="right" 
          visible={true}
          className="absolute left-0 top-1/2 -translate-y-1/2"
        />
      )}
      
      {hasNextTab && (
        <SwipeIndicator 
          direction="left" 
          visible={true}
          className="absolute right-0 top-1/2 -translate-y-1/2"
        />
      )}
    </>
  );
};

export default SwipeIndicators;
