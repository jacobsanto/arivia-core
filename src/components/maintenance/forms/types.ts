
import { z } from "zod";

export const maintenanceFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  property: z.string().min(1, "Property is required"),
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.string().min(1, "Due date is required"),
  assignee: z.string().min(1, "Assignee is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  requiredTools: z.string().optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;
