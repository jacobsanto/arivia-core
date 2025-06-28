
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
    const { cleaningDetails, templateId, ...taskData } = data;
    
    // Use template checklist if provided, otherwise use default or generate based on cleaning type
    let checklist;
    if (selectedTemplate) {
      checklist = selectedTemplate.items.map(item => ({ ...item, completed: false }));
    } else {
      checklist = data.checklist || getCleaningChecklist(data.cleaningType || "Standard");
    }
    
    // Create a unique ID (using string since our Task interface uses string IDs now)
    const newId = Math.max(...tasks.map(t => parseInt(t.id) || 0), 0) + 1;
    
    // Create the base task
    const newTask = {
      ...taskData,
      type: "Housekeeping",
      id: newId.toString(), // Convert to string
      status: "Pending" as const,
      approvalStatus: null,
      rejectionReason: null,
      photos: [],
      checklist,
    };
    
    // Add cleaning details if provided
    if (cleaningDetails) {
      newTask.cleaningDetails = cleaningDetails;
    }
    
    setTasks([...tasks, newTask]);
    toastService.success(`Housekeeping task "${data.title}" created successfully!`);
    
    // Reset selected template
    setSelectedTemplate(null);
    
    // If this is a multi-cleaning schedule, create the additional tasks
    if (cleaningDetails && cleaningDetails.scheduledCleanings && cleaningDetails.scheduledCleanings.length > 1) {
      // Skip first and last cleanings (check-in and check-out) as the main task covers one of them
      for (let i = 1; i < cleaningDetails.scheduledCleanings.length - 1; i++) {
        const cleaningDate = new Date(cleaningDetails.scheduledCleanings[i]);
        const cleaningType = i % 2 === 1 ? "Linen & Towel Change" : "Full";
        
        const additionalId = Math.max(...tasks.map(t => parseInt(t.id) || 0), 0) + 1 + i;
        
        const additionalTask = {
          ...taskData,
          title: `${cleaningType} - ${data.property}`,
          type: "Housekeeping",
          id: additionalId.toString(), // Convert to string
          status: "Pending" as const,
          approvalStatus: null,
          rejectionReason: null,
          photos: [],
          dueDate: cleaningDate.toISOString(), // Convert to string
          checklist: getCleaningChecklist(cleaningType),
          cleaningDetails: {
            ...cleaningDetails,
            cleaningType
          }
        };
        
        setTasks(prevTasks => [...prevTasks, additionalTask]);
      }
      
      toastService.success(`${cleaningDetails.scheduledCleanings.length - 1} additional cleaning tasks were created for the stay duration.`);
    }
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
