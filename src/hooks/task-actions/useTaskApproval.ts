
import { Task } from "@/types/taskTypes";
import { toastService } from "@/services/toast";

export const useTaskApproval = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  selectedTask: Task | null,
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>
) => {
  const handleApproveTask = () => {
    if (selectedTask) {
      const updatedTasks = tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task, 
            approvalStatus: "Approved" as const
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      setSelectedTask({
        ...selectedTask,
        approvalStatus: "Approved"
      });
      
      toastService.success(`Task "${selectedTask.title}" has been approved!`);
    }
  };

  const handleRejectTask = () => {
    if (selectedTask) {
      const rejectionReason = prompt("Please provide a reason for rejection:");
      
      if (rejectionReason) {
        const updatedTasks = tasks.map(task => {
          if (task.id === selectedTask.id) {
            return {
              ...task, 
              approvalStatus: "Rejected" as const,
              rejectionReason: rejectionReason
            };
          }
          return task;
        });
        
        setTasks(updatedTasks);
        setSelectedTask({
          ...selectedTask,
          approvalStatus: "Rejected",
          rejectionReason: rejectionReason
        });
        
        toastService.error(`Task "${selectedTask.title}" has been rejected.`);
      }
    }
  };

  return {
    handleApproveTask,
    handleRejectTask
  };
};
