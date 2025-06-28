
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface BookingCleaningTasksIndicatorProps {
  hasCleaningTasks: boolean;
  tasksCount?: number;
  stayDuration: number;
}

const BookingCleaningTasksIndicator: React.FC<BookingCleaningTasksIndicatorProps> = ({
  hasCleaningTasks,
  tasksCount = 0,
  stayDuration
}) => {
  const getExpectedTasksCount = (duration: number) => {
    if (duration <= 3) return 2; // Pre-arrival + post-checkout
    if (duration <= 5) return 4; // Pre-arrival + full cleaning + linen change + post-checkout
    if (duration <= 7) return 6; // Pre-arrival + 2 full cleanings + 2 linen changes + post-checkout
    return 2; // Pre-arrival + custom schedule (minimum)
  };

  const expectedTasks = getExpectedTasksCount(stayDuration);
  const isComplete = hasCleaningTasks && tasksCount >= expectedTasks;
  const isPartial = hasCleaningTasks && tasksCount > 0 && tasksCount < expectedTasks;

  const getTasksDescription = (duration: number) => {
    if (duration <= 3) return "Standard cleaning before/after stay";
    if (duration <= 5) return "Pre-arrival + 1 full cleaning + 1 linen change + post-checkout";
    if (duration <= 7) return "Pre-arrival + 2 full cleanings + 2 linen changes + post-checkout";
    return "Custom cleaning schedule for extended stay";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {isComplete ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {tasksCount} tasks
              </Badge>
            ) : isPartial ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {tasksCount}/{expectedTasks} tasks
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                No tasks
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{stayDuration}-night stay</p>
            <p>{getTasksDescription(stayDuration)}</p>
            {isPartial && (
              <p className="text-yellow-600">Incomplete: {tasksCount}/{expectedTasks} tasks generated</p>
            )}
            {!hasCleaningTasks && (
              <p className="text-red-600">No cleaning tasks generated yet</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BookingCleaningTasksIndicator;
