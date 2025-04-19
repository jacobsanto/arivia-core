
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

interface SettingsStatusBadgeProps {
  status: "configured" | "not-configured" | "needs-attention";
  lastUpdated?: Date;
  className?: string;
}

const SettingsStatusBadge: React.FC<SettingsStatusBadgeProps> = ({
  status,
  lastUpdated,
  className
}) => {
  let content;
  let tooltip;
  
  switch (status) {
    case "configured":
      content = (
        <Badge className={cn("bg-green-500 hover:bg-green-600 px-2 gap-1", className)}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Configured</span>
        </Badge>
      );
      tooltip = lastUpdated 
        ? `Last updated: ${format(lastUpdated, 'PPp')}` 
        : "Settings are properly configured";
      break;
      
    case "needs-attention":
      content = (
        <Badge variant="destructive" className={cn("px-2 gap-1", className)}>
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Needs Attention</span>
        </Badge>
      );
      tooltip = "Settings require attention";
      break;
      
    case "not-configured":
    default:
      content = (
        <Badge variant="outline" className={cn("px-2 gap-1 border-dashed", className)}>
          <Circle className="h-3.5 w-3.5" />
          <span>Not Configured</span>
        </Badge>
      );
      tooltip = "Settings have not been configured";
      break;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SettingsStatusBadge;
