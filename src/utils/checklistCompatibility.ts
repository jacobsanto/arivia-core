// Compatibility adapter to transform between new and old ChecklistTemplate formats
import { LegacyChecklistTemplate } from '@/types/checklistTypes';
import { ChecklistTemplate as NewChecklistTemplate } from '@/types/checklistTypes';
import { ChecklistItem } from '@/types/taskTypes';
import { ChecklistItem as OldChecklistItem } from '@/types/taskTypes';

// Transform new template format to old format for legacy compatibility
export const transformToOldFormat = (newTemplate: NewChecklistTemplate): LegacyChecklistTemplate => {
  return {
    id: newTemplate.id,
    name: newTemplate.name || newTemplate.title,
    description: newTemplate.description || '',
    category: newTemplate.category,
    items: newTemplate.items.map((item, index) => ({
      id: index + 1, // Convert string id to number for compatibility
      title: item.title,
      completed: item.completed || false
    })),
    createdBy: newTemplate.createdBy || '',
    createdAt: newTemplate.createdAt,
    updatedAt: newTemplate.updatedAt,
    isDefault: false
  };
};

// Transform old checklist items to new format  
export const transformToNewFormat = (oldItems: OldChecklistItem[]): ChecklistItem[] => {
  return oldItems.map((item, index) => ({
    id: index + 1,
    title: item.title,
    completed: item.completed
  }));
};

// Transform new checklist items to old format
export const transformToOldItems = (newItems: ChecklistItem[]): OldChecklistItem[] => {
  return newItems.map((item, index) => ({
    id: index + 1,
    title: item.title,
    completed: item.completed || false
  }));
};