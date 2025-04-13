
import { ChecklistTemplate } from "@/types/checklistTypes";

export const initialChecklistTemplates: ChecklistTemplate[] = [
  {
    id: 1,
    name: "Standard Cleaning",
    description: "Basic cleaning checklist for regular housekeeping tasks",
    category: "Housekeeping",
    createdBy: "Admin",
    createdAt: "2025-04-01T10:00:00",
    isDefault: true,
    items: [
      { id: 1, title: "Dust and wipe all surfaces and furniture", completed: false },
      { id: 2, title: "Sweep, vacuum, and mop all floors", completed: false },
      { id: 3, title: "Sanitize bathrooms (toilets, showers, sinks)", completed: false },
      { id: 4, title: "Restock bathroom toiletries", completed: false },
      { id: 5, title: "Clean kitchen (countertops, sink, appliances)", completed: false },
      { id: 6, title: "Remove leftover food and trash", completed: false },
      { id: 7, title: "Make beds with fresh linens", completed: false },
      { id: 8, title: "Set out clean towels", completed: false },
      { id: 9, title: "Empty all trash bins", completed: false },
      { id: 10, title: "Final check and finishing touches", completed: false }
    ]
  },
  {
    id: 2,
    name: "Full Cleaning",
    description: "Comprehensive cleaning checklist for full property cleaning",
    category: "Housekeeping",
    createdBy: "Admin",
    createdAt: "2025-04-01T10:15:00",
    isDefault: true,
    items: [
      { id: 1, title: "Dust and wipe all surfaces", completed: false },
      { id: 2, title: "Sweep, vacuum, and mop all floors", completed: false },
      { id: 3, title: "Clean and sanitize bathrooms", completed: false },
      { id: 4, title: "Wipe down kitchen countertops and sink", completed: false },
      { id: 5, title: "Empty all trash bins", completed: false },
      { id: 6, title: "Make beds and tidy common areas", completed: false }
    ]
  },
  {
    id: 3,
    name: "Linen & Towel Change",
    description: "Checklist for linen and towel replacement tasks",
    category: "Housekeeping",
    createdBy: "Admin",
    createdAt: "2025-04-01T10:30:00",
    isDefault: true,
    items: [
      { id: 1, title: "Replace bed sheets", completed: false },
      { id: 2, title: "Replace pillowcases", completed: false },
      { id: 3, title: "Replace duvet covers if needed", completed: false },
      { id: 4, title: "Replace bath towels", completed: false },
      { id: 5, title: "Replace hand towels", completed: false },
      { id: 6, title: "Replace face towels", completed: false },
      { id: 7, title: "Collect used linens and towels", completed: false }
    ]
  },
  {
    id: 4,
    name: "Basic Maintenance Check",
    description: "Standard maintenance inspection checklist",
    category: "Maintenance",
    createdBy: "Admin",
    createdAt: "2025-04-01T11:00:00",
    isDefault: true,
    items: [
      { id: 1, title: "Check all light fixtures and replace bulbs as needed", completed: false },
      { id: 2, title: "Inspect plumbing for leaks", completed: false },
      { id: 3, title: "Test all electrical outlets", completed: false },
      { id: 4, title: "Verify smoke and CO detectors are working", completed: false },
      { id: 5, title: "Check HVAC system", completed: false },
      { id: 6, title: "Inspect pool equipment if applicable", completed: false },
      { id: 7, title: "Test all appliances", completed: false }
    ]
  }
];
