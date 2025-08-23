
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
        { id: 7, title: "Sanitize kitchen", completed: false },
        { id: 8, title: "Replace bathroom amenities", completed: false },
        { id: 9, title: "Clean outside areas/balcony", completed: false },
        { id: 10, title: "Restock kitchen essentials", completed: false }
      ];
    case 'linen & towel change':
      return [
        { id: 1, title: "Change bed linens", completed: false },
        { id: 2, title: "Replace bath towels", completed: false },
        { id: 3, title: "Replace kitchen towels", completed: false },
        { id: 4, title: "Quick bathroom cleanup", completed: false },
        { id: 5, title: "Empty bathroom trash", completed: false },
        { id: 6, title: "Wipe down countertops", completed: false }
      ];
    case 'custom':
      return [
        { id: 1, title: "Custom cleaning items to be defined", completed: false }
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

  // Based on Arivia's cleaning service breakdown by length of stay:
  if (stayDuration <= 3) {
    // Stays of Up to 3 Nights: Only full cleaning before check-in
    // No additional cleaning during stay
  } 
  else if (stayDuration <= 5) {
    // Stays of Up to 5 Nights: Full cleaning + 1 standard cleaning mid-stay
    const midStayDate = addDays(checkIn, Math.floor(stayDuration / 2));
    scheduledCleanings.push(format(midStayDate, "yyyy-MM-dd"));
    cleaningTypes.push("Standard");
  }
  else if (stayDuration <= 7) {
    // Stays of Up to 7 Nights: Full cleaning + 2 standard cleanings during stay
    const firstCleanDate = addDays(checkIn, Math.floor(stayDuration / 3));
    scheduledCleanings.push(format(firstCleanDate, "yyyy-MM-dd"));
    cleaningTypes.push("Standard");
    
    const secondCleanDate = addDays(checkIn, Math.floor((stayDuration * 2) / 3));
    scheduledCleanings.push(format(secondCleanDate, "yyyy-MM-dd"));
    cleaningTypes.push("Standard");
  }
  else {
    // Stays of More Than 7 Nights: Custom schedule with guest coordination
    // Default to cleaning every 3-4 days with full cleaning and linen changes
    let currentDay = addDays(checkIn, 3);
    let cleaningCount = 0;
    
    while (differenceInDays(checkOut, currentDay) > 1) {
      scheduledCleanings.push(format(currentDay, "yyyy-MM-dd"));
      
      // Alternate between full cleaning and linen/towel changes
      if (cleaningCount % 2 === 0) {
        cleaningTypes.push("Full");
      } else {
        cleaningTypes.push("Linen & Towel Change");
      }
      
      currentDay = addDays(currentDay, 3);
      cleaningCount++;
    }
  }

  return { scheduledCleanings, cleaningTypes, stayDuration };
};
