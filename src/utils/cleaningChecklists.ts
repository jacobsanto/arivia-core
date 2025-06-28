
import { ChecklistItem } from "@/types/taskTypes";
import { format, addDays, differenceInDays } from "date-fns";

export const getCleaningChecklist = (cleaningType: string): ChecklistItem[] => {
  switch (cleaningType.toLowerCase()) {
    case 'standard cleaning':
    case 'standard':
      return [
        { id: 1, title: "Dust and wipe all surfaces, furniture and fixtures", completed: false },
        { id: 2, title: "Deep floor cleaning - sweep, vacuum and mop all floors", completed: false },
        { id: 3, title: "Bathroom sanitization - scrub toilets, showers, sinks", completed: false },
        { id: 4, title: "Restock essential toiletries", completed: false },
        { id: 5, title: "Kitchen cleaning - wipe countertops, sink, remove trash", completed: false },
        { id: 6, title: "Make beds with fresh linens and towels", completed: false },
        { id: 7, title: "Trash removal and waste disposal", completed: false },
        { id: 8, title: "Final check and finishing touches", completed: false }
      ];
    case 'full cleaning':
    case 'full':
      return [
        { id: 1, title: "General dusting and wiping of all surfaces", completed: false },
        { id: 2, title: "Sweep, mop and vacuum all floors", completed: false },
        { id: 3, title: "Bathroom refresh - sanitize sinks, showers and toilets", completed: false },
        { id: 4, title: "Kitchen wipe-down - countertops and sink", completed: false },
        { id: 5, title: "Trash removal from all rooms", completed: false },
        { id: 6, title: "Bed-making and tidying of common areas", completed: false }
      ];
    case 'linen & towel change':
    case 'linen and towel change':
    case 'linen':
      return [
        { id: 1, title: "Replace bed linens - sheets, pillowcases, duvet covers", completed: false },
        { id: 2, title: "Provide fresh towels - bath, hand and face towels", completed: false },
        { id: 3, title: "Collect used linens and towels for laundering", completed: false }
      ];
    case 'custom cleaning schedule':
    case 'custom':
      return [
        { id: 1, title: "Coordinate with guest to arrange cleaning schedule", completed: false },
        { id: 2, title: "Plan regular full cleaning services based on guest preferences", completed: false },
        { id: 3, title: "Schedule linen and towel changes at agreed intervals", completed: false }
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

  // Pre-arrival Standard Cleaning (check-in preparation)
  const preArrivalDate = addDays(checkIn, -1);
  scheduledCleanings.push(format(preArrivalDate, "yyyy-MM-dd"));
  cleaningTypes.push("Standard Cleaning");

  // Apply new cleaning breakdown by length of stay
  if (stayDuration <= 3) {
    // Up to 3 nights: No additional cleaning during stay
  }
  else if (stayDuration <= 5) {
    // Up to 5 nights: Two cleaning sessions during stay
    const midStayDate = addDays(checkIn, Math.floor(stayDuration / 2));
    scheduledCleanings.push(format(midStayDate, "yyyy-MM-dd"));
    cleaningTypes.push("Full Cleaning");
    
    const linenChangeDate = addDays(checkIn, Math.floor(stayDuration / 2) + 1);
    scheduledCleanings.push(format(linenChangeDate, "yyyy-MM-dd"));
    cleaningTypes.push("Linen & Towel Change");
  }
  else if (stayDuration <= 7) {
    // Up to 7 nights: Three cleaning sessions during stay
    const firstCleanDate = addDays(checkIn, Math.floor(stayDuration / 3));
    scheduledCleanings.push(format(firstCleanDate, "yyyy-MM-dd"));
    cleaningTypes.push("Full Cleaning");
    
    const firstLinenDate = addDays(checkIn, Math.floor(stayDuration / 3) + 1);
    scheduledCleanings.push(format(firstLinenDate, "yyyy-MM-dd"));
    cleaningTypes.push("Linen & Towel Change");
    
    const secondCleanDate = addDays(checkIn, Math.floor((stayDuration / 3) * 2));
    scheduledCleanings.push(format(secondCleanDate, "yyyy-MM-dd"));
    cleaningTypes.push("Full Cleaning");
    
    const secondLinenDate = addDays(checkIn, Math.floor((stayDuration / 3) * 2) + 1);
    scheduledCleanings.push(format(secondLinenDate, "yyyy-MM-dd"));
    cleaningTypes.push("Linen & Towel Change");
  }
  else {
    // More than 7 nights: Custom cleaning schedule required
    const customScheduleDate = addDays(checkIn, 1);
    scheduledCleanings.push(format(customScheduleDate, "yyyy-MM-dd"));
    cleaningTypes.push("Custom Cleaning Schedule");
  }

  // Post-checkout Standard Cleaning
  scheduledCleanings.push(format(checkOut, "yyyy-MM-dd"));
  cleaningTypes.push("Standard Cleaning");

  return { scheduledCleanings, cleaningTypes, stayDuration };
};
