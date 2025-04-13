
import { Task } from "@/types/taskTypes";
import { toastService } from "@/services/toast";

export const useTaskMedia = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  selectedTask: Task | null,
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>
) => {
  const handlePhotoUpload = (file: File) => {
    if (!selectedTask) return;
    
    const photoUrl = URL.createObjectURL(file);
    
    const updatedPhotos = selectedTask.photos ? [...selectedTask.photos, photoUrl] : [photoUrl];
    
    const updatedTask = {
      ...selectedTask,
      photos: updatedPhotos
    };
    
    setSelectedTask(updatedTask);
    
    setTasks(tasks.map(task => 
      task.id === selectedTask.id ? updatedTask : task
    ));
    
    toastService.success(`Photo verification uploaded for task!`);
  };

  return {
    handlePhotoUpload
  };
};
