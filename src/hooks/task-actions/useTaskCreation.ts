import { useState } from "react";
import { Task } from "@/types/taskTypes";
import { ChecklistTemplate } from "@/types/checklistTypes";
import { toastService } from "@/services/toast";
import { getCleaningChecklist } from "@/utils/cleaningChecklists";
import { supabase } from "@/integrations/supabase/client";

export const useTaskCreation = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);

  const handleCreateTask = async (data: any) => {
    try {
      // Extract cleaning-specific data
      const { cleaningDetails, templateId, ...taskData } = data;
      
      // Use template checklist if provided, otherwise use default or generate based on cleaning type
      let checklist;
      if (selectedTemplate) {
        checklist = selectedTemplate.items.map(item => ({ ...item, completed: false }));
      } else {
        checklist = data.checklist || getCleaningChecklist(data.cleaningType || "Standard");
      }
      
      // Get the first available property listing_id from Guesty
      const { data: listings } = await supabase
        .from('guesty_listings')
        .select('id')
        .limit(1);
      
      const listingId = listings?.[0]?.id || 'manual-task';
      
      // Create the housekeeping task in database (using type assertion for fields not in generated types)
      const { data: newTask, error } = await (supabase as any)
        .from('housekeeping_tasks')
        .insert({
          listing_id: listingId,
          booking_id: `manual-${Date.now()}`, // Manual tasks get unique booking ID
          due_date: taskData.dueDate.toISOString().split('T')[0], // Convert to date string
          task_type: cleaningDetails?.cleaningType || 'Standard Cleaning',
          description: `${taskData.title} - ${taskData.description || ''}`.trim(),
          status: 'pending',
          assigned_to: taskData.assignee,
          checklist: JSON.parse(JSON.stringify(checklist)),
          additional_actions: cleaningDetails ? JSON.parse(JSON.stringify([cleaningDetails])) : []
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Create the task object for local state
      const taskForState = {
        ...taskData,
        type: "Housekeeping",
        id: newTask.id,
        status: "Pending" as const,
        approvalStatus: null,
        rejectionReason: null,
        photos: [],
        checklist,
      };
      
      // Add cleaning details if provided
      if (cleaningDetails) {
        taskForState.cleaningDetails = cleaningDetails;
      }
      
      setTasks(prevTasks => [...prevTasks, taskForState]);
      toastService.success(`Housekeeping task "${data.title}" created successfully!`);
      
      // Reset selected template
      setSelectedTemplate(null);
      
      // If this is a multi-cleaning schedule, create the additional tasks
      if (cleaningDetails && cleaningDetails.scheduledCleanings && cleaningDetails.scheduledCleanings.length > 1) {
        // Skip first and last cleanings (check-in and check-out) as the main task covers one of them
        for (let i = 1; i < cleaningDetails.scheduledCleanings.length - 1; i++) {
          const cleaningDate = new Date(cleaningDetails.scheduledCleanings[i]);
          const cleaningType = i % 2 === 1 ? "Linen & Towel Change" : "Full";
          
          const additionalChecklist = getCleaningChecklist(cleaningType);
          const { data: additionalTask } = await (supabase as any)
            .from('housekeeping_tasks')
            .insert({
              listing_id: listingId,
              booking_id: `manual-${Date.now()}-${i}`,
              due_date: cleaningDate.toISOString().split('T')[0],
              task_type: cleaningType,
              description: `${cleaningType} - ${data.property}`,
              status: 'pending',
              assigned_to: taskData.assignee,
              checklist: JSON.parse(JSON.stringify(additionalChecklist)),
              additional_actions: JSON.parse(JSON.stringify([{ ...cleaningDetails, cleaningType }]))
            })
            .select()
            .single();
          
          if (additionalTask) {
            const additionalTaskForState = {
              ...taskData,
              title: `${cleaningType} - ${data.property}`,
              type: "Housekeeping",
              id: additionalTask.id,
              status: "Pending" as const,
              approvalStatus: null,
              rejectionReason: null,
              photos: [],
              dueDate: cleaningDate.toISOString(),
              checklist: getCleaningChecklist(cleaningType),
              cleaningDetails: {
                ...cleaningDetails,
                cleaningType
              }
            };
            
            setTasks(prevTasks => [...prevTasks, additionalTaskForState]);
          }
        }
        
        toastService.success(`${cleaningDetails.scheduledCleanings.length - 1} additional cleaning tasks were created for the stay duration.`);
      }
    } catch (error) {
      toastService.error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
