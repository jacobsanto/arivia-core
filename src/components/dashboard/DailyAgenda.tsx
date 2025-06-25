
import React, { useMemo } from "react";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { AgendaContent } from "./agenda/AgendaContent";
import { AgendaHeader } from "./agenda/AgendaHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface DailyAgendaProps {
  housekeepingTasks: Task[];
  maintenanceTasks: MaintenanceTask[];
  onRefresh?: () => void;
  onCreateTask?: () => void;
}

const DailyAgenda: React.FC<DailyAgendaProps> = ({ 
  housekeepingTasks = [], 
  maintenanceTasks = [],
  onRefresh,
  onCreateTask
}) => {
  const isMobile = useIsMobile();
  
  // Filter tasks for today
  const today = new Date().toISOString().split('T')[0];
  
  const todaysTasks = useMemo(() => {
    const housekeepingToday = housekeepingTasks.filter(task => 
      task.due_date?.startsWith(today)
    );
    const maintenanceToday = maintenanceTasks.filter(task => 
      task.due_date?.startsWith(today)
    );
    
    return [...housekeepingToday, ...maintenanceToday];
  }, [housekeepingTasks, maintenanceTasks, today]);

  const hasTasks = todaysTasks.length > 0;

  return (
    <div className="space-y-4">
      <AgendaHeader 
        totalTasks={todaysTasks.length}
        onRefresh={onRefresh}
        compact={isMobile}
      />
      
      {hasTasks ? (
        <AgendaContent 
          housekeepingTasks={housekeepingTasks.filter(task => 
            task.due_date?.startsWith(today)
          )}
          maintenanceTasks={maintenanceTasks.filter(task => 
            task.due_date?.startsWith(today)
          )}
        />
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Tasks Scheduled for Today"
          description="You're all caught up! No housekeeping or maintenance tasks are scheduled for today."
          action={onCreateTask ? {
            label: "Create New Task",
            onClick: onCreateTask,
            variant: "outline"
          } : undefined}
          compact={isMobile}
        />
      )}
    </div>
  );
};

export default DailyAgenda;
