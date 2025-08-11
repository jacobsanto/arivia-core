import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardGridProps extends React.ComponentProps<"div"> {
  cols?: { base?: 1 | 2; sm?: 1 | 2 | 3; md?: 1 | 2 | 3 | 4; lg?: 1 | 2 | 3 | 4; xl?: 1 | 2 | 3 | 4 };
  equalHeight?: boolean;
}

const mapCols = (prefix: string, n?: number) => {
  switch (n) {
    case 1: return `${prefix}:grid-cols-1`;
    case 2: return `${prefix}:grid-cols-2`;
    case 3: return `${prefix}:grid-cols-3`;
    case 4: return `${prefix}:grid-cols-4`;
    default: return undefined;
  }
};

/**
 * CardGrid
 * Responsive grid with cohesive gaps and optional equal-height children.
 */
export function CardGrid({ className, children, cols, equalHeight = false, ...props }: CardGridProps) {
  const base = cols?.base ?? 1;
  const sm = cols?.sm;
  const md = cols?.md;
  const lg = cols?.lg;
  const xl = cols?.xl;

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        base === 1 ? "grid-cols-1" : base === 2 ? "grid-cols-2" : "grid-cols-1",
        mapCols("sm", sm),
        mapCols("md", md),
        mapCols("lg", lg),
        mapCols("xl", xl),
        equalHeight && "[&>*]:h-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default CardGrid;
