
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CleaningDetails } from "@/types/taskTypes";

interface TaskCleaningDetailsProps {
  cleaningDetails: CleaningDetails;
}

const TaskCleaningDetails = ({ cleaningDetails }: TaskCleaningDetailsProps) => {
  if (!cleaningDetails) return null;
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "PPP");
  };
  
  const getBadgeColor = (type: string) => {
    switch(type) {
      case "Standard":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Full":
        return "bg-green-100 text-green-800 border-green-200";
      case "Linen & Towel Change":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Cleaning Details</h3>
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <Badge className={`${getBadgeColor(cleaningDetails.cleaningType || "Standard")}`}>
            {cleaningDetails.cleaningType || "Standard"}
          </Badge>
        </div>
        
        {cleaningDetails.stayDuration && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stay Duration:</span>
            <span>{cleaningDetails.stayDuration} nights</span>
          </div>
        )}
        
        {cleaningDetails.guestCheckIn && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Check In:</span>
            <span>{formatDate(cleaningDetails.guestCheckIn)}</span>
          </div>
        )}
        
        {cleaningDetails.guestCheckOut && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Check Out:</span>
            <span>{formatDate(cleaningDetails.guestCheckOut)}</span>
          </div>
        )}
      </div>
      
      {cleaningDetails.scheduledCleanings && cleaningDetails.scheduledCleanings.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1">
            Scheduled Cleanings
          </h4>
          <div className="border rounded-md p-2 bg-background/50 max-h-40 overflow-y-auto">
            {cleaningDetails.scheduledCleanings.map((cleaning, index) => (
              <div key={index} className="flex justify-between items-center py-1 text-sm border-b last:border-b-0">
                <span>{format(cleaning, "PPP")}</span>
                <span className="text-xs">
                  {index === 0 || index === cleaningDetails.scheduledCleanings!.length - 1
                    ? "Standard" : index % 2 === 0 ? "Full" : "Linen & Towel"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCleaningDetails;
