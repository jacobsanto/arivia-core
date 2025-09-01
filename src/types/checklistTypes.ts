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

// Define checklist types
export type ChecklistType = 'housekeeping' | 'maintenance' | 'inspection';

// Type colors and labels for display
export const CHECKLIST_TYPE_LABELS: Record<ChecklistType, string> = {
  housekeeping: 'Housekeeping',
  maintenance: 'Maintenance', 
  inspection: 'Inspection'
};

export const CHECKLIST_TYPE_COLORS: Record<ChecklistType, string> = {
  housekeeping: 'bg-blue-100 text-blue-800 border-blue-200',
  maintenance: 'bg-purple-100 text-purple-800 border-purple-200',
  inspection: 'bg-green-100 text-green-800 border-green-200'
};

// Template item interface for new section-based structure
export interface ChecklistTemplateItem {
  id: string;
  text: string;
  completed?: boolean;
  order: number;
}

// Section interface for grouping items
export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistTemplateItem[];
  order: number;
}

// Main ChecklistTemplate interface - consolidated from both type systems
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
  // New fields for enhanced templates
  title?: string;
  type?: ChecklistType;
  sections?: ChecklistSection[];
  isActive?: boolean;
}

// Legacy interface for backward compatibility
export type LegacyChecklistTemplate = ChecklistTemplate;

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