
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

// Re-export types properly for isolatedModules
export type { ChecklistItem as ChecklistItemType };
export type { ChecklistTemplate as ChecklistTemplateType };
