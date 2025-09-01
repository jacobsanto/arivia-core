export type ChecklistType = 'housekeeping' | 'maintenance' | 'inspection';

export interface ChecklistTemplateItem {
  id: string;
  text: string;
  completed?: boolean;
  order: number;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistTemplateItem[];
  order: number;
}

// Updated to be compatible with existing system
export interface ChecklistTemplate {
  id: string;
  name: string; // Using 'name' instead of 'title' for compatibility
  title: string; // Keep both for backward compatibility
  description?: string;
  type: ChecklistType;
  category: string; // Add category for compatibility
  sections: ChecklistSection[];
  items: ChecklistTemplateItem[]; // Flattened items for compatibility
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistTemplateFormData {
  title: string;
  description: string;
  type: ChecklistType;
  sections: ChecklistSection[];
}

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