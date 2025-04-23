
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";

interface ApiUsageTabProps {
  remainingRequests: number | null;
  quotaUsage: Record<string, {
    total: number;
    remaining: number;
    limit: number;
  }>;
}

export const ApiUsageTab: React.FC<ApiUsageTabProps> = ({
  remainingRequests,
  quotaUsage
}) => {
  const getProgressValue = (remaining: number, limit: number) => {
    if (!limit) return 0;
    const percentage = (remaining / limit) * 100;
    return Math.max(0, Math.min(100, percentage)); // Clamp between 0-100
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 20) return "bg-red-500"; 
    if (percentage < 50) return "bg-amber-500";
    return "bg-green-500";
  };

  const hasAnyUsage = Object.keys(quotaUsage).length > 0;

  return (
    <div className="space-y-4">
      {remainingRequests !== null && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>API Quota Remaining</span>
            <span className="font-medium">{remainingRequests}</span>
          </div>
          <Progress value={remainingRequests} className="h-2" />
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Endpoint Usage</h3>
        
        {hasAnyUsage ? (
          Object.entries(quotaUsage).map(([endpoint, usage]) => {
            const percentage = getProgressValue(usage.remaining, usage.limit);
            const colorClass = getProgressColor(percentage);
            return (
              <div key={endpoint} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span>{endpoint}</span>
                  <span>{usage.remaining}/{usage.limit} remaining</span>
                </div>
                <Progress 
                  value={percentage}
                  className="h-1.5" 
                  style={{ "--progress-indicator-color": `var(--${colorClass.replace('bg-', '')})` } as React.CSSProperties}
                />
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-3 text-muted-foreground text-xs">
            <Info className="h-3 w-3 mr-1" />
            <span>
              {remainingRequests === null
                ? "No API usage data available"
                : "No recent endpoint usage data recorded"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

