
import React from "react";
import { CardContent } from "@/components/ui/card";
import { EndpointUsage } from "./types";

interface StatisticsTabProps {
  totalCalls24h: number;
  mostUsedEndpoint: string;
  lastRateLimitError: string;
  endpointUsage: EndpointUsage[];
  formatEndpointName: (endpoint: string) => string;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({
  totalCalls24h,
  mostUsedEndpoint,
  lastRateLimitError,
  endpointUsage,
  formatEndpointName
}) => {
  return (
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="bg-muted rounded-lg p-2">
            <div className="text-muted-foreground mb-1">Calls in last 24h</div>
            <div className="font-medium text-base">{totalCalls24h}</div>
          </div>
          <div className="bg-muted rounded-lg p-2">
            <div className="text-muted-foreground mb-1">Most used endpoint</div>
            <div className="font-medium text-base truncate">{mostUsedEndpoint}</div>
          </div>
          <div className="bg-muted rounded-lg p-2">
            <div className="text-muted-foreground mb-1">Last rate limit error</div>
            <div className="font-medium text-base truncate">{lastRateLimitError}</div>
          </div>
        </div>
        
        <div>
          <div className="font-medium text-xs mb-2">Endpoint Usage (last 24h)</div>
          <div className="space-y-2">
            {endpointUsage.map((item) => (
              <div key={item.endpoint}>
                <div className="flex justify-between mb-1 text-xs">
                  <span className="truncate">{formatEndpointName(item.endpoint)}</span>
                  <span>{item.count} calls</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                  {/* Success bar */}
                  {item.status && item.status.success > 0 && (
                    <div 
                      className="bg-emerald-500 h-full" 
                      style={{ width: `${(item.status.success / Number(item.count)) * 100}%` }}
                    />
                  )}
                  {/* Error bar */}
                  {item.status && item.status.error > 0 && (
                    <div 
                      className="bg-amber-500 h-full" 
                      style={{ width: `${(item.status.error / Number(item.count)) * 100}%` }}
                    />
                  )}
                  {/* Rate limit bar */}
                  {item.status && item.status.rateLimit > 0 && (
                    <div 
                      className="bg-red-500 h-full" 
                      style={{ width: `${(item.status.rateLimit / Number(item.count)) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Color key */}
          <div className="flex gap-4 text-xs mt-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Success</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>Error</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Rate Limited</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  );
};
