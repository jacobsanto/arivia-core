
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

interface SwipeIndicatorProps {
  direction: "left" | "right" | "up" | "down";
  visible?: boolean;
  className?: string;
}

export function SwipeIndicator({
  direction,
  visible = true,
  className
}: SwipeIndicatorProps) {
  const getIcon = () => {
    switch (direction) {
      case "left": return <ChevronLeft className="h-4 w-4" />;
      case "right": return <ChevronRight className="h-4 w-4" />;
      case "up": return <ChevronUp className="h-4 w-4" />;
      case "down": return <ChevronDown className="h-4 w-4" />;
    }
  };
  
  return (
    <div
      className={cn(
        "absolute flex items-center justify-center rounded-full p-1 bg-primary/20 text-primary transition-opacity",
        {
          "left-2": direction === "right",
          "right-2": direction === "left",
          "top-2": direction === "down",
          "bottom-2": direction === "up",
          "opacity-0": !visible,
          "opacity-100": visible,
          "animate-pulse": visible
        },
        className
      )}
    >
      {getIcon()}
    </div>
  );
}
