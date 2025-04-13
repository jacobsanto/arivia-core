
import { ChecklistItem } from "../types/taskTypes";

export const standardCleaningChecklist: ChecklistItem[] = [
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
];

export const fullCleaningChecklist: ChecklistItem[] = [
  { id: 1, title: "Dust and wipe all surfaces", completed: false },
  { id: 2, title: "Sweep, vacuum, and mop all floors", completed: false },
  { id: 3, title: "Clean and sanitize bathrooms", completed: false },
  { id: 4, title: "Wipe down kitchen countertops and sink", completed: false },
  { id: 5, title: "Empty all trash bins", completed: false },
  { id: 6, title: "Make beds and tidy common areas", completed: false }
];

export const linenTowelChangeChecklist: ChecklistItem[] = [
  { id: 1, title: "Replace bed sheets", completed: false },
  { id: 2, title: "Replace pillowcases", completed: false },
  { id: 3, title: "Replace duvet covers if needed", completed: false },
  { id: 4, title: "Replace bath towels", completed: false },
  { id: 5, title: "Replace hand towels", completed: false },
  { id: 6, title: "Replace face towels", completed: false },
  { id: 7, title: "Collect used linens and towels", completed: false }
];

// Generate checklist based on cleaning type
export const getCleaningChecklist = (cleaningType: string): ChecklistItem[] => {
  switch (cleaningType) {
    case "Standard":
      return [...standardCleaningChecklist];
    case "Full":
      return [...fullCleaningChecklist];
    case "Linen & Towel Change":
      return [...linenTowelChangeChecklist];
    default:
      return [];
  }
};

// Generate cleaning schedule based on stay duration
export const generateCleaningSchedule = (
  checkIn: Date,
  checkOut: Date
): { 
  scheduledCleanings: string[],
  cleaningTypes: string[]
} => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const dayDiff = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const scheduledCleanings: string[] = [];
  const cleaningTypes: string[] = [];
  
  // Always add check-in and check-out standard cleanings
  scheduledCleanings.push(checkInDate.toISOString());
  cleaningTypes.push("Standard");

  scheduledCleanings.push(checkOutDate.toISOString());
  cleaningTypes.push("Standard");
  
  // Add intermediate cleanings based on length of stay
  if (dayDiff <= 3) {
    // No additional cleaning
  } else if (dayDiff <= 5) {
    // One full cleaning + one linen change
    const midStay = new Date(checkInDate);
    midStay.setDate(midStay.getDate() + Math.floor(dayDiff / 2));
    scheduledCleanings.push(midStay.toISOString());
    cleaningTypes.push("Full");
    
    const linenChange = new Date(midStay);
    linenChange.setDate(linenChange.getDate() + 1);
    scheduledCleanings.push(linenChange.toISOString());
    cleaningTypes.push("Linen & Towel Change");
  } else if (dayDiff <= 7) {
    // Two full cleanings + two linen changes
    const firstCleaning = new Date(checkInDate);
    firstCleaning.setDate(firstCleaning.getDate() + Math.floor(dayDiff / 3));
    scheduledCleanings.push(firstCleaning.toISOString());
    cleaningTypes.push("Full");
    
    const firstLinenChange = new Date(firstCleaning);
    firstLinenChange.setDate(firstLinenChange.getDate() + 1);
    scheduledCleanings.push(firstLinenChange.toISOString());
    cleaningTypes.push("Linen & Towel Change");
    
    const secondCleaning = new Date(checkInDate);
    secondCleaning.setDate(secondCleaning.getDate() + Math.floor(dayDiff * 2 / 3));
    scheduledCleanings.push(secondCleaning.toISOString());
    cleaningTypes.push("Full");
    
    const secondLinenChange = new Date(secondCleaning);
    secondLinenChange.setDate(secondLinenChange.getDate() + 1);
    scheduledCleanings.push(secondLinenChange.toISOString());
    cleaningTypes.push("Linen & Towel Change");
  } else {
    // For longer stays, we'd normally customize with the guest
    // But we'll provide a default week-based schedule
    let currentDate = new Date(checkInDate);
    while (currentDate < checkOutDate) {
      currentDate.setDate(currentDate.getDate() + 2); // Every two days
      if (currentDate < checkOutDate) {
        scheduledCleanings.push(new Date(currentDate).toISOString());
        cleaningTypes.push("Full");
      }
      
      currentDate.setDate(currentDate.getDate() + 1); // Next day for linen change
      if (currentDate < checkOutDate) {
        scheduledCleanings.push(new Date(currentDate).toISOString());
        cleaningTypes.push("Linen & Towel Change");
      }
      
      // Skip a day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return { scheduledCleanings, cleaningTypes };
};
