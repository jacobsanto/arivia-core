
import { ChecklistItem } from "./taskTypes";

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  items: ChecklistItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
