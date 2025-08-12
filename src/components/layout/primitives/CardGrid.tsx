import * as React from "react";
import { cn } from "@/lib/utils";

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * CardGrid
 * Responsive grid for cards/content blocks using spacing tokens.
 */
export function CardGrid({ children, className, columns }: CardGridProps) {
  const cls = cn(
    "grid gap-4 md:gap-6",
    columns?.base && `grid-cols-${columns.base}`,
    columns?.sm && `sm:grid-cols-${columns.sm}`,
    columns?.md && `md:grid-cols-${columns.md}`,
    columns?.lg && `lg:grid-cols-${columns.lg}`,
    columns?.xl && `xl:grid-cols-${columns.xl}`,
    !columns && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    className
  );
  return <div className={cls}>{children}</div>;
}

export default CardGrid;
