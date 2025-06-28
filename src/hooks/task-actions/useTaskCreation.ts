
import { useState } from "react";
import { Task } from "@/types/taskTypes";
import { ChecklistTemplate } from "@/types/checklistTypes";
import { toastService } from "@/services/toast";
import { getCleaningChecklist } from "@/utils/cleaningChecklists";

export const useTaskCreation = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);

  const handleCreateTask = (data: any) => {
    // Extract cleaning-specific data
    const { cleaningDetails, templateId, cleaningServiceType, ...taskData } = data;
    
    // Use template checklist if provided, otherwise generate based on cleaning service type
    let checklist;
    if (selectedTemplate) {
      checklist = selectedTemplate.items.map(item => ({ ...item, completed: false }));
    } else {
      checklist = getCleaningChecklist(cleaningServiceType || "Standard Cleaning");
    }
    
    // Create a unique ID
    const newId = Math.max(...tasks.map(t => parseInt(t.id) || 0), 0) + 1;
    
    // Create the base task
    const newTask = {
      ...taskData,
      type: "Housekeeping",
      id: newId.toString(),
      status: "Pending" as const,
      approvalStatus: null,
      rejectionReason: null,
      photos: [],
      checklist,
      cleaningServiceType: cleaningServiceType || "Standard Cleaning",
    };
    
    // Add cleaning details if provided
    if (cleaningDetails) {
      newTask.cleaningDetails = cleaningDetails;
    }
    
    setTasks([...tasks, newTask]);
    toastService.success(`${cleaningServiceType || 'Housekeeping'} task "${data.title}" created successfully!`);
    
    // Reset selected template
    setSelectedTemplate(null);
  };

  const handleSelectTemplate = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    toastService.success(`Template "${template.name}" selected for use.`);
  };

  return {
    selectedTemplate,
    handleCreateTask,
    handleSelectTemplate
  };
};
