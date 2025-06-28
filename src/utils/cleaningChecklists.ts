
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

  // Pre-arrival Standard Cleaning (check-in preparation)
  const preArrivalDate = addDays(checkIn, -1);
  scheduledCleanings.push(format(preArrivalDate, "yyyy-MM-dd"));
  cleaningTypes.push("Standard Cleaning");

  // Mid-stay services based on duration
  if (stayDuration >= 3 && stayDuration <= 5) {
    // One Full Cleaning mid-stay
    const midStayDate = addDays(checkIn, Math.floor(stayDuration / 2));
    scheduledCleanings.push(format(midStayDate, "yyyy-MM-dd"));
    cleaningTypes.push("Full Cleaning");
    
    // Linen & Towel Change day before checkout if stay is 4+ nights
    if (stayDuration >= 4) {
      const linenChangeDate = addDays(checkOut, -1);
      scheduledCleanings.push(format(linenChangeDate, "yyyy-MM-dd"));
      cleaningTypes.push("Linen & Towel Change");
    }
  }
  else if (stayDuration >= 6 && stayDuration <= 7) {
    // Two Full Cleaning sessions
    const firstCleanDate = addDays(checkIn, Math.floor(stayDuration / 3));
    scheduledCleanings.push(format(firstCleanDate, "yyyy-MM-dd"));
    cleaningTypes.push("Full Cleaning");
    
    const secondCleanDate = addDays(checkIn, Math.floor((stayDuration / 3) * 2));
    scheduledCleanings.push(format(secondCleanDate, "yyyy-MM-dd"));
    cleaningTypes.push("Full Cleaning");
    
    // Linen & Towel Change scheduled separately
    const linenChangeDate = addDays(checkIn, Math.floor(stayDuration / 2));
    scheduledCleanings.push(format(linenChangeDate, "yyyy-MM-dd"));
    cleaningTypes.push("Linen & Towel Change");
  }
  else if (stayDuration > 7) {
    // Extended stays - custom schedule required
    // Create initial Full Cleaning and Linen Change, but flag for manual scheduling
    const firstCleanDate = addDays(checkIn, 3);
    scheduledCleanings.push(format(firstCleanDate, "yyyy-MM-dd"));
    cleaningTypes.push("Full Cleaning");
    
    const firstLinenDate = addDays(checkIn, 4);
    scheduledCleanings.push(format(firstLinenDate, "yyyy-MM-dd"));
    cleaningTypes.push("Linen & Towel Change");
  }

  // Post-checkout Standard Cleaning
  scheduledCleanings.push(format(checkOut, "yyyy-MM-dd"));
  cleaningTypes.push("Standard Cleaning");

  return { scheduledCleanings, cleaningTypes, stayDuration };
};
