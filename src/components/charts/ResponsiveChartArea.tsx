import * as React from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export interface ResponsiveChartAreaProps {
  children: React.ReactNode;
  height?: number;
  className?: string;
  withContainer?: boolean;
}

/**
 * ResponsiveChartArea
 * Provides a consistent, mobile-friendly chart area with optional ResponsiveContainer.
 */
export function ResponsiveChartArea({
  children,
  height = 320,
  className,
  withContainer = true,
}: ResponsiveChartAreaProps) {
  return (
    <div className={cn("w-full chart-responsive", className)} style={{ height }}>
      {withContainer ? (
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      ) : (
        children
      )}
    </div>
  );
}

export default ResponsiveChartArea;
