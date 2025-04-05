
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types/taskTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { TaskCardHeader } from "./card/TaskCardHeader";
import { TaskCardStatusBadges } from "./card/TaskCardStatusBadges";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const isMobile = useIsMobile();

  return (
    <Card
      className="hover:bg-secondary/50 cursor-pointer transition-colors"
      onClick={onClick}
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
    </Card>
  );
};

export default TaskCard;
