
import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

type SwipeDirection = 'left' | 'right';
type SwipeSize = 'sm' | 'md' | 'lg';
type SwipeVariant = 'ghost' | 'solid';

interface SwipeIndicatorProps {
  direction: SwipeDirection;
  visible: boolean;
  className?: string;
  size?: SwipeSize;
  variant?: SwipeVariant;
}

export const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({
  direction,
  visible,
  className,
  size = 'md',
  variant = 'ghost'
}) => {
  if (!visible) return null;
  
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };
  
  const variantClasses = {
    ghost: 'bg-transparent text-muted-foreground',
    solid: 'bg-primary/10 text-primary'
  };
  
  return (
    <div 
      className={cn(
        'absolute flex items-center justify-center rounded-full animate-pulse-swipe',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {direction === 'left' ? (
        <ChevronsRight className="h-4 w-4" />
      ) : (
        <ChevronsLeft className="h-4 w-4" />
      )}
    </div>
  );
};
