
import React from "react";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BookingSyncStatusProps {
  lastSynced: string | null;
}

export const BookingSyncStatus: React.FC<BookingSyncStatusProps> = ({ lastSynced }) => {
  if (!lastSynced) return null;
  
  const syncDate = new Date(lastSynced);
  
  if (!isValid(syncDate)) return null;
  
  const formattedDate = format(syncDate, "PPp");
  const timeAgo = formatDistanceToNow(syncDate, { addSuffix: true });
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs text-muted-foreground flex items-center">
            <Info className="h-3 w-3 mr-1" /> 
            Last synced {timeAgo}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Last synced at {formattedDate}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
