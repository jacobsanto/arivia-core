
import React from "react";
import { Clock, ArrowDownCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CardContent } from "@/components/ui/card";
import { ApiUsageRecord } from "./types";
import { formatEndpointName, calculateTimeToReset } from "../utils/apiUsageUtils";

interface LiveStatusTabProps {
  latestUsage: ApiUsageRecord[];
}

export const LiveStatusTab: React.FC<LiveStatusTabProps> = ({ latestUsage }) => {
  return (
    <CardContent>
      <div className="space-y-3 text-sm">
        {latestUsage.map((usage) => (
          <div key={usage.endpoint} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="font-medium capitalize">
                {formatEndpointName(usage.endpoint)}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3.5 w-3.5" />
                <span>{calculateTimeToReset(usage.reset)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Progress
                value={
                  usage.rate_limit && typeof usage.rate_limit === 'number'
                    ? ((usage.rate_limit - (usage.remaining || 0)) / usage.rate_limit) * 100
                    : 0
                }
                className="h-2"
              />
              <span className="text-xs whitespace-nowrap">
                {usage.remaining}/{usage.rate_limit} left
              </span>
            </div>
          </div>
        ))}

        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <ArrowDownCircle className="h-3.5 w-3.5" /> 
          <span>Updated {latestUsage[0] ? new Date(latestUsage[0].timestamp).toLocaleTimeString() : 'Unknown'}</span>
        </div>
      </div>
    </CardContent>
  );
};
