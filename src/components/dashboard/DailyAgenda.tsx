
import React, { useMemo } from "react";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { AgendaContent } from "./agenda/AgendaContent";
import { AgendaHeader } from "./agenda/AgendaHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar } from "lucide-react";
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
      task.dueDate?.startsWith(today)
    );
    const maintenanceToday = maintenanceTasks.filter(task => 
      task.dueDate?.startsWith(today)
    );
    
    return [...housekeepingToday, ...maintenanceToday];
  }, [housekeepingTasks, maintenanceTasks, today]);

  const hasTasks = todaysTasks.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Today's Agenda</h2>
        <span className="text-sm text-muted-foreground">
          {todaysTasks.length} {todaysTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      
      {hasTasks ? (
        <div className="space-y-3">
          {housekeepingTasks
            .filter(task => task.dueDate?.startsWith(today))
            .map(task => (
              <div key={task.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.property}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          
          {maintenanceTasks
            .filter(task => task.dueDate?.startsWith(today))
            .map(task => (
              <div key={task.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.property}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
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
