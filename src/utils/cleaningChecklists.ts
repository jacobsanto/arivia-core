
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
  
  // For stays up to 3 nights: Only one standard cleaning at checkout
  if (dayDiff <= 3) {
    scheduledCleanings.push(checkOutDate.toISOString());
    cleaningTypes.push("Standard");
  } 
  // For stays up to 5 nights: One full cleaning + one linen change
  else if (dayDiff <= 5) {
    // Add checkout cleaning
    scheduledCleanings.push(checkOutDate.toISOString());
    cleaningTypes.push("Standard");
    
    // Add one full cleaning in the middle of the stay
    const midStay = new Date(checkInDate);
    midStay.setDate(midStay.getDate() + Math.floor(dayDiff / 2));
    scheduledCleanings.push(midStay.toISOString());
    cleaningTypes.push("Full");
    
    // Add one linen change a day after full cleaning
    const linenChange = new Date(midStay);
    linenChange.setDate(linenChange.getDate() + 1);
    scheduledCleanings.push(linenChange.toISOString());
    cleaningTypes.push("Linen & Towel Change");
  } 
  // For stays up to 7 nights: Two full cleanings + one linen change
  else if (dayDiff <= 7) {
    // Add checkout cleaning
    scheduledCleanings.push(checkOutDate.toISOString());
    cleaningTypes.push("Standard");
    
    // Add first full cleaning about 1/3 into the stay
    const firstCleaning = new Date(checkInDate);
    firstCleaning.setDate(firstCleaning.getDate() + Math.floor(dayDiff / 3));
    scheduledCleanings.push(firstCleaning.toISOString());
    cleaningTypes.push("Full");
    
    // Add one linen change in the middle
    const linenChange = new Date(checkInDate);
    linenChange.setDate(linenChange.getDate() + Math.floor(dayDiff / 2));
    scheduledCleanings.push(linenChange.toISOString());
    cleaningTypes.push("Linen & Towel Change");
    
    // Add second full cleaning about 2/3 into the stay
    const secondCleaning = new Date(checkInDate);
    secondCleaning.setDate(secondCleaning.getDate() + Math.floor(dayDiff * 2 / 3));
    scheduledCleanings.push(secondCleaning.toISOString());
    cleaningTypes.push("Full");
  } 
  // For longer stays (7+ nights): At least two full cleanings, one standard, and custom schedule
  else {
    // Add checkout cleaning
    scheduledCleanings.push(checkOutDate.toISOString());
    cleaningTypes.push("Standard");
    
    // Add standard full cleanings every 3 days
    let currentDate = new Date(checkInDate);
    currentDate.setDate(currentDate.getDate() + 3); // First full cleaning after 3 days
    
    while (currentDate < checkOutDate) {
      if ((checkOutDate.getTime() - currentDate.getTime()) > (3 * 24 * 60 * 60 * 1000)) {
        // Only add if we're more than 3 days from checkout
        scheduledCleanings.push(new Date(currentDate).toISOString());
        cleaningTypes.push("Full");
      }
      
      // Move to next interval
      currentDate.setDate(currentDate.getDate() + 3);
    }
    
    // Add linen change in the middle of the stay
    const linenChange = new Date(checkInDate);
    linenChange.setDate(linenChange.getDate() + Math.floor(dayDiff / 2));
    scheduledCleanings.push(linenChange.toISOString());
    cleaningTypes.push("Linen & Towel Change");
    
    // Add another full cleaning a week into the stay if we have a long stay
    if (dayDiff > 10) {
      const extraCleaning = new Date(checkInDate);
      extraCleaning.setDate(extraCleaning.getDate() + 7);
      scheduledCleanings.push(extraCleaning.toISOString());
      cleaningTypes.push("Full");
    }
  }
  
  // Sort the cleanings by date
  const sortedDates = scheduledCleanings.map((dateStr, i) => ({ 
    date: new Date(dateStr), 
    type: cleaningTypes[i] 
  }))
  .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return { 
    scheduledCleanings: sortedDates.map(item => item.date.toISOString()), 
    cleaningTypes: sortedDates.map(item => item.type)
  };
};
