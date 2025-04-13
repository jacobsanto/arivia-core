
import { ChecklistItem } from "./taskTypes";

export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string | null;
  taskType: string; // 'Housekeeping' or 'Maintenance'
  items: ChecklistItem[];
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ChecklistTemplateFormValues {
  title: string;
  description: string;
  taskType: string;
  items: ChecklistItem[];
  isActive: boolean;
}
