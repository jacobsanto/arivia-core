
export interface ChecklistItem {
  id: string;
  title: string;
  text: string;
  completed: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  items: ChecklistItem[];
  isActive: boolean;
  isDefault?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplateFormValues {
  name: string;
  description: string;
  category: string;
  items: { title: string }[];
}

// Checklist categories
export const CHECKLIST_CATEGORIES = [
  'Cleaning',
  'Maintenance',
  'Inspection',
  'Guest Services',
  'Safety',
  'General'
] as const;

// Schema for form validation
export const checklistTemplateSchema = {
  name: { required: true, minLength: 1 },
  description: { required: false },
  category: { required: true },
  items: { required: true, minLength: 1 }
};

// Re-export types properly for isolatedModules
export type { ChecklistItem as ChecklistItemType };
export type { ChecklistTemplate as ChecklistTemplateType };
