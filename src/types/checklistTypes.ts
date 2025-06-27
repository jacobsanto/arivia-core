
import { ChecklistItem } from "./taskTypes";
import { z } from "zod";

// Define checklist categories
export const CHECKLIST_CATEGORIES = [
  "Housekeeping",
  "Maintenance",
  "Inventory",
  "General",
  "Safety",
  "Welcome"
] as const;

export type ChecklistCategoryType = typeof CHECKLIST_CATEGORIES[number];

// Define the ChecklistTemplate interface
export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  items: ChecklistItem[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  isDefault?: boolean;
}

// Define the form values for creating/editing a template
export interface ChecklistTemplateFormValues {
  id?: string;
  name: string;
  description: string;
  category: string;
  items: { title: string }[];
}

// Zod schema for template form validation
export const checklistTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  items: z.array(
    z.object({
      title: z.string().min(1, "Item cannot be empty")
    })
  ).min(1, "Add at least one checklist item")
});

// Export ChecklistItem from taskTypes for consistency
export { ChecklistItem } from "./taskTypes";
