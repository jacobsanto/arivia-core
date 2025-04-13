
import { z } from "zod";

export interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
}

export interface ChecklistTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  items: ChecklistItem[];
  createdBy: string;
  createdAt: string;
  isDefault?: boolean;
}

export const checklistTemplateSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  items: z.array(
    z.object({
      title: z.string().min(3, "Item title must be at least 3 characters"),
    })
  ).min(1, "At least one checklist item is required"),
});

export type ChecklistTemplateFormValues = z.infer<typeof checklistTemplateSchema>;

export const CHECKLIST_CATEGORIES = [
  "Housekeeping",
  "Maintenance",
  "Inventory",
  "Property",
  "General"
];
