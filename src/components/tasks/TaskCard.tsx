
import React, { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { SwipeableCard } from "@/components/ui/swipeable-card";
import { Task } from "@/types/taskTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { TaskCardHeader } from "./card/TaskCardHeader";
import { TaskCardStatusBadges } from "./card/TaskCardStatusBadges";
import { Check, X } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onComplete?: (task: Task) => void;
  onReject?: (task: Task) => void;
}

const TaskCard = ({ task, onClick, onComplete, onReject }: TaskCardProps) => {
  const isMobile = useIsMobile();
  const [swipeAction, setSwipeAction] = useState<string | null>(null);

  // Handle swipe right to complete
  const handleSwipeRight = () => {
    if (onComplete) {
      setSwipeAction("complete");
      setTimeout(() => {
        onComplete(task);
        setSwipeAction(null);
      }, 500);
    }
  };

  // Handle swipe left to reject
  const handleSwipeLeft = () => {
    if (onReject) {
      setSwipeAction("reject");
      setTimeout(() => {
        onReject(task);
        setSwipeAction(null);
      }, 500);
    }
  };

  // Get appropriate feedback color based on swipe direction
  const getSwipeFeedbackColor = () => {
    if (swipeAction === "complete") return "rgba(22, 163, 74, 0.2)"; // Green
    if (swipeAction === "reject") return "rgba(220, 38, 38, 0.2)"; // Red
    return "rgba(0, 0, 0, 0.1)"; // Default
  };

  // Show swipe feedback icons
  const renderSwipeIcon = () => {
    if (swipeAction === "complete") {
      return (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-100 rounded-full p-2">
          <Check className="h-6 w-6 text-green-600" />
        </div>
      );
    }
    if (swipeAction === "reject") {
      return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-100 rounded-full p-2">
          <X className="h-6 w-6 text-red-600" />
        </div>
      );
    }
    return null;
  };

  return (
    <SwipeableCard
      className={`hover:bg-secondary/50 cursor-pointer transition-colors relative ${
        swipeAction ? 'opacity-80' : ''
      }`}
      onClick={onClick}
      onSwipeRight={onComplete ? handleSwipeRight : undefined}
      onSwipeLeft={onReject ? handleSwipeLeft : undefined}
      swipeEnabled={isMobile}
      feedbackColor={getSwipeFeedbackColor()}
    >
      <CardContent className="p-5">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-row justify-between items-center'}`}>
          <TaskCardHeader 
            title={task.title}
            type={task.type}
            approvalStatus={task.approvalStatus}
            property={task.property}
          />
          <TaskCardStatusBadges
            status={task.status}
            priority={task.priority}
            approvalStatus={task.approvalStatus}
            isMobile={isMobile}
            dueDate={task.dueDate}
          />
        </div>
      </CardContent>
      {renderSwipeIcon()}
    </SwipeableCard>
  );
};

export default TaskCard;
