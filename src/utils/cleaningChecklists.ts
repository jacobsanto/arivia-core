
import { ChecklistItem } from "@/types/taskTypes";
import { format, addDays, differenceInDays } from "date-fns";

export const getCleaningChecklist = (cleaningType: string): ChecklistItem[] => {
  switch (cleaningType.toLowerCase()) {
    case 'standard':
      return [
        { id: 1, title: "Clean bathroom", completed: false },
        { id: 2, title: "Make bed with fresh linens", completed: false },
        { id: 3, title: "Vacuum floors", completed: false },
        { id: 4, title: "Clean kitchen area", completed: false },
        { id: 5, title: "Empty trash", completed: false }
      ];
    case 'full':
      return [
        { id: 1, title: "Deep clean bathroom", completed: false },
        { id: 2, title: "Clean behind furniture", completed: false },
        { id: 3, title: "Change all linens", completed: false },
        { id: 4, title: "Vacuum and mop floors", completed: false },
        { id: 5, title: "Dust all surfaces", completed: false },
        { id: 6, title: "Clean windows", completed: false },
        { id: 7, title: "Sanitize kitchen", completed: false }
      ];
    case 'linen & towel change':
      return [
        { id: 1, title: "Change bed linens", completed: false },
        { id: 2, title: "Replace bath towels", completed: false },
        { id: 3, title: "Replace kitchen towels", completed: false },
        { id: 4, title: "Quick bathroom cleanup", completed: false }
      ];
    default:
      return [
        { id: 1, title: "General cleaning", completed: false },
        { id: 2, title: "Dust surfaces", completed: false },
        { id: 3, title: "Vacuum floors", completed: false }
      ];
  }
};

export const generateCleaningSchedule = (checkIn: Date, checkOut: Date) => {
  const stayDuration = differenceInDays(checkOut, checkIn);
  const scheduledCleanings: string[] = [];
  const cleaningTypes: string[] = [];

  // Always add check-in day (pre-arrival cleaning)
  scheduledCleanings.push(format(checkIn, "yyyy-MM-dd"));
  cleaningTypes.push("Full");

  // For stays longer than 3 days, add mid-stay cleaning every 3 days
  if (stayDuration > 3) {
    let currentDay = addDays(checkIn, 3);
    while (differenceInDays(checkOut, currentDay) > 1) {
      scheduledCleanings.push(format(currentDay, "yyyy-MM-dd"));
      cleaningTypes.push("Linen & Towel Change");
      currentDay = addDays(currentDay, 3);
    }
  }

  // Always add check-out day
  scheduledCleanings.push(format(checkOut, "yyyy-MM-dd"));
  cleaningTypes.push("Full");

  return { scheduledCleanings, cleaningTypes, stayDuration };
};
