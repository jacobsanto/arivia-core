import * as React from "react";
import { cn } from "@/lib/utils";

export type MobileScrollProps = {
  children: React.ReactNode;
  className?: string;
  orientation?: "x" | "y" | "both";
  ariaLabel?: string;
};

/**
 * MobileScroll
 * Wraps content with consistent, mobile-friendly scrolling behavior.
 * Uses the global `.mobile-scroll` utility (momentum, hidden scrollbars, etc.).
 */
export function MobileScroll({
  children,
  className,
  orientation = "x",
  ariaLabel,
}: MobileScrollProps) {
  const overflowCls =
    orientation === "x"
      ? "overflow-x-auto"
      : orientation === "y"
      ? "overflow-y-auto"
      : "overflow-auto";

  return (
    <div
      className={cn("mobile-scroll w-full", overflowCls, className)}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

export default MobileScroll;
