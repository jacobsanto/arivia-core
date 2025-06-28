
import { Task } from "@/types/taskTypes";
import { ChecklistTemplate } from "@/types/checklistTypes";

export const useTaskChecklist = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  selectedTask: Task | null,
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>
) => {
  const handleToggleChecklistItem = (itemId: number) => {
    if (selectedTask) {
      const updatedChecklist = selectedTask.checklist.map((item) => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      
      const updatedTask = {
        ...selectedTask,
        checklist: updatedChecklist,
      };

      setSelectedTask(updatedTask);
      
      setTasks(tasks.map(task => 
        task.id === selectedTask.id ? updatedTask : task
      ));
    }
  };

  return {
    handleToggleChecklistItem
  };
};
