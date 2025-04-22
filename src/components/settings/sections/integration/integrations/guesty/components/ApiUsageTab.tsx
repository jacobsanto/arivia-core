
import React from 'react';
import { Progress } from "@/components/ui/progress";

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
        {Object.entries(quotaUsage).map(([endpoint, usage]) => (
          <div key={endpoint} className="text-xs">
            <div className="flex justify-between mb-1">
              <span>{endpoint}</span>
              <span>{usage.remaining}/{usage.limit} remaining</span>
            </div>
            <Progress 
              value={(usage.remaining / usage.limit) * 100} 
              className="h-1.5" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

