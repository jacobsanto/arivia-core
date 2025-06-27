
import { ChecklistItem } from "@/types/taskTypes";

export const getCleaningChecklist = (cleaningType: string): ChecklistItem[] => {
  const baseChecklist: ChecklistItem[] = [
    { id: "1", title: "Vacuum all rooms", text: "Vacuum all rooms", completed: false },
    { id: "2", title: "Change bed linens", text: "Change bed linens", completed: false },
    { id: "3", title: "Clean bathrooms", text: "Clean bathrooms", completed: false },
    { id: "4", title: "Clean kitchen", text: "Clean kitchen", completed: false },
    { id: "5", title: "Empty trash bins", text: "Empty trash bins", completed: false }
  ];

  const deepCleaningItems: ChecklistItem[] = [
    { id: "6", title: "Clean inside appliances", text: "Clean inside appliances", completed: false },
    { id: "7", title: "Wash windows", text: "Wash windows", completed: false },
    { id: "8", title: "Clean baseboards", text: "Clean baseboards", completed: false },
    { id: "9", title: "Deep clean carpets", text: "Deep clean carpets", completed: false },
    { id: "10", title: "Sanitize all surfaces", text: "Sanitize all surfaces", completed: false },
    { id: "11", title: "Clean light fixtures", text: "Clean light fixtures", completed: false },
    { id: "12", title: "Organize storage areas", text: "Organize storage areas", completed: false },
    { id: "13", title: "Check all amenities", text: "Check all amenities", completed: false },
    { id: "14", title: "Replace air fresheners", text: "Replace air fresheners", completed: false }
  ];

  const linenChangeItems: ChecklistItem[] = [
    { id: "15", title: "Change all bed linens", text: "Change all bed linens", completed: false },
    { id: "16", title: "Replace towels", text: "Replace towels", completed: false },
    { id: "17", title: "Check towel inventory", text: "Check towel inventory", completed: false },
    { id: "18", title: "Fold and store clean linens", text: "Fold and store clean linens", completed: false }
  ];

  switch (cleaningType) {
    case "Standard Cleaning":
      return baseChecklist;
    case "Full Cleaning":
      return [...baseChecklist, ...deepCleaningItems];
    case "Linen & Towel Change":
      return linenChangeItems;
    default:
      return baseChecklist;
  }
};

export const generateCleaningSchedule = (
  checkIn: Date,
  checkOut: Date,
  stayDuration: number
): Date[] => {
  const schedule: Date[] = [];
  
  if (stayDuration <= 2) {
    // Short stays: only checkout cleaning
    schedule.push(checkOut);
  } else if (stayDuration <= 5) {
    // Medium stays: mid-stay and checkout
    const midPoint = new Date(checkIn.getTime() + (stayDuration / 2) * 24 * 60 * 60 * 1000);
    schedule.push(midPoint, checkOut);
  } else {
    // Long stays: multiple cleanings
    const interval = Math.floor(stayDuration / 3);
    for (let i = interval; i < stayDuration; i += interval) {
      const cleaningDate = new Date(checkIn.getTime() + i * 24 * 60 * 60 * 1000);
      schedule.push(cleaningDate);
    }
    schedule.push(checkOut);
  }
  
  return schedule;
};
