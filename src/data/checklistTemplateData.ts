
import { ChecklistTemplate } from '@/types/checklistTypes';

export const defaultChecklistTemplates: ChecklistTemplate[] = [
  {
    id: '1',
    name: 'Standard Room Cleaning',
    description: 'Basic cleaning checklist for guest rooms',
    category: 'Cleaning',
    items: [
      { id: '1-1', title: 'Make beds', text: 'Make beds', completed: false },
      { id: '1-2', title: 'Vacuum floors', text: 'Vacuum floors', completed: false },
      { id: '1-3', title: 'Clean bathroom', text: 'Clean bathroom', completed: false },
      { id: '1-4', title: 'Dust surfaces', text: 'Dust surfaces', completed: false }
    ],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true
  },
  {
    id: '2',
    name: 'Deep Cleaning',
    description: 'Comprehensive deep cleaning checklist',
    category: 'Cleaning',
    items: [
      { id: '2-1', title: 'Strip and remake beds', text: 'Strip and remake beds', completed: false },
      { id: '2-2', title: 'Deep clean bathroom', text: 'Deep clean bathroom', completed: false },
      { id: '2-3', title: 'Clean all surfaces thoroughly', text: 'Clean all surfaces thoroughly', completed: false },
      { id: '2-4', title: 'Vacuum and mop floors', text: 'Vacuum and mop floors', completed: false }
    ],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true
  },
  {
    id: '3',
    name: 'Check-in Preparation',
    description: 'Prepare room for incoming guests',
    category: 'Guest Services',
    items: [
      { id: '3-1', title: 'Check room temperature', text: 'Check room temperature', completed: false },
      { id: '3-2', title: 'Ensure amenities are stocked', text: 'Ensure amenities are stocked', completed: false },
      { id: '3-3', title: 'Check lighting and electronics', text: 'Check lighting and electronics', completed: false }
    ],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true
  },
  {
    id: '4',
    name: 'Basic Maintenance Check',
    description: 'Regular maintenance inspection',
    category: 'Maintenance',
    items: [
      { id: '4-1', title: 'Check plumbing', text: 'Check plumbing', completed: false },
      { id: '4-2', title: 'Test electrical systems', text: 'Test electrical systems', completed: false },
      { id: '4-3', title: 'Inspect furniture', text: 'Inspect furniture', completed: false }
    ],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true
  },
  {
    id: '5',
    name: 'Safety Inspection',
    description: 'Safety and security checklist',
    category: 'Safety',
    items: [
      { id: '5-1', title: 'Check smoke detectors', text: 'Check smoke detectors', completed: false },
      { id: '5-2', title: 'Test door locks', text: 'Test door locks', completed: false },
      { id: '5-3', title: 'Inspect emergency exits', text: 'Inspect emergency exits', completed: false }
    ],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true
  },
  {
    id: '6',
    name: 'General Property Inspection',
    description: 'Overall property condition check',
    category: 'Inspection',
    items: [
      { id: '6-1', title: 'Exterior condition', text: 'Exterior condition', completed: false },
      { id: '6-2', title: 'Common areas', text: 'Common areas', completed: false },
      { id: '6-3', title: 'Pool and outdoor facilities', text: 'Pool and outdoor facilities', completed: false }
    ],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true
  }
];
