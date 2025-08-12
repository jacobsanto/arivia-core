import * as React from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface ChartWrapperProps {
  height?: number; // px
  className?: string;
  children: React.ReactElement; // Your Recharts chart
}

/**
 * ChartWrapper
 * Consistent responsive container for charts with sensible default height.
 */
export function ChartWrapper({ height = 300, className, children }: ChartWrapperProps) {
  return (
    <div className={cn("w-full chart-responsive", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export default ChartWrapper;
