
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export type SettingsStatus = "configured" | "not-configured" | "needs-attention";

interface SettingsSectionBadgeProps {
  status: SettingsStatus;
  lastUpdated?: Date;
}

const SettingsSectionBadge: React.FC<SettingsSectionBadgeProps> = ({ 
  status, 
  lastUpdated 
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={
              status === "configured" ? "success" : 
              status === "needs-attention" ? "warning" : 
              "secondary"
            }
          >
            <span className="flex items-center gap-1 px-1">
              {status === "configured" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : status === "needs-attention" ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              <span className="text-xs">
                {status === "configured" ? "Configured" : 
                 status === "needs-attention" ? "Needs Attention" : 
                 "Not Configured"}
              </span>
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="right">
          {lastUpdated ? (
            <p className="text-xs">Last updated: {formatDate(lastUpdated)}</p>
          ) : (
            <p className="text-xs">Not configured yet</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SettingsSectionBadge;
