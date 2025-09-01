// Compatibility adapter to transform new ChecklistTemplate format to old format
import { ChecklistTemplate as OldChecklistTemplate } from '@/types/checklistTypes';
import { ChecklistTemplate as NewChecklistTemplate } from '@/types/checklists.types';

export const transformToOldFormat = (newTemplate: NewChecklistTemplate): OldChecklistTemplate => {
  return {
    id: newTemplate.id,
    name: newTemplate.name || newTemplate.title,
    description: newTemplate.description || '',
    category: newTemplate.category,
    items: newTemplate.items.map((item, index) => ({
      id: index + 1, // Convert string id to number for compatibility
      title: item.text,
      completed: item.completed || false
    })),
    createdBy: newTemplate.createdBy || '',
    createdAt: newTemplate.createdAt.toISOString(),
    updatedAt: newTemplate.updatedAt?.toISOString(),
    isDefault: false
  };
};