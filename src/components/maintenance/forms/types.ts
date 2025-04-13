
import { z } from "zod";
import { ChecklistItem } from "@/types/taskTypes";

export const maintenanceFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  property: z.string().min(1, "Property is required"),
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.string().min(1, "Due date is required"),
  assignee: z.string().min(1, "Assignee is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  requiredTools: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema> & {
  checklist?: ChecklistItem[];
};
