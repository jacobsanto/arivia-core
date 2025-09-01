
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

// Legacy ChecklistTemplate interface (for backward compatibility)
export interface LegacyChecklistTemplate {
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

// Re-export as ChecklistTemplate for now to maintain compatibility
export type ChecklistTemplate = LegacyChecklistTemplate;

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
