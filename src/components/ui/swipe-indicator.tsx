
import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

interface SwipeIndicatorProps {
  direction: "left" | "right" | "up" | "down";
  visible?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "subtle" | "solid";
}

export function SwipeIndicator({
  direction,
  visible = true,
  className,
  size = "md",
  variant = "subtle"
}: SwipeIndicatorProps) {
  const getIcon = () => {
    switch (direction) {
      case "left": return <ChevronLeft className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />;
      case "right": return <ChevronRight className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />;
      case "up": return <ChevronUp className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />;
      case "down": return <ChevronDown className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />;
    }
  };
  
  return (
    <div
      className={cn(
        "absolute flex items-center justify-center rounded-full text-primary transition-all",
        {
          // Size variants
          "p-0.5": size === "sm",
          "p-1": size === "md",
          "p-1.5": size === "lg",
          
          // Position variants
          "left-2": direction === "right",
          "right-2": direction === "left",
          "top-2": direction === "down",
          "bottom-2": direction === "up",
          
          // Visibility
          "opacity-0 scale-90": !visible,
          "opacity-100 scale-100": visible,
          
          // Variant styles
          "bg-primary/10": variant === "subtle",
          "bg-primary text-primary-foreground": variant === "solid",
          
          // Animation
          "animate-pulse-swipe": visible
        },
        className
      )}
    >
      {getIcon()}
    </div>
  );
}
