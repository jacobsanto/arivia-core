import * as React from "react";
import { cn } from "@/lib/utils";

export type TouchTargetProps<T extends React.ElementType = "button"> = {
  as?: T;
  className?: string;
  ripple?: boolean;
} & React.ComponentPropsWithoutRef<T>;

/**
 * TouchTarget
 * Ensures minimum tap size and consistent touch feedback on mobile.
 * Adds `.interactive-element` and `.touch-feedback` classes from mobile styles.
 */
export function TouchTarget<T extends React.ElementType = "button">({
  as,
  className,
  ripple = false,
  ...props
}: TouchTargetProps<T>) {
  const Comp = (as || "button") as React.ElementType;
  return (
    <Comp
      className={cn(
        "interactive-element touch-feedback",
        ripple && "touch-ripple",
        className
      )}
      {...(props as any)}
    />
  );
}

export default TouchTarget;
