import { ChecklistTemplate } from "@/types/checklistTypes";
import { v4 as uuidv4 } from "uuid";

// Define initial checklist templates for maintenance and housekeeping
export const checklistTemplates: ChecklistTemplate[] = [
  // Housekeeping Templates
  {
    id: "1",
    name: "Standard Room Cleaning",
    description: "Complete checklist for standard daily room cleaning",
    category: "Housekeeping",
    items: [
      { id: 1, title: "Make bed with fresh linens", completed: false },
      { id: 2, title: "Dust all surfaces and furniture", completed: false },
      { id: 3, title: "Vacuum carpet and floors", completed: false },
      { id: 4, title: "Clean and sanitize bathroom", completed: false },
      { id: 5, title: "Empty trash bins", completed: false },
      { id: 6, title: "Restock toiletries and supplies", completed: false },
      { id: 7, title: "Check for any damages or maintenance issues", completed: false },
      { id: 8, title: "Clean windows and mirrors", completed: false }
    ],
    createdBy: "System",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: "2",
    name: "Deep Cleaning",
    description: "Thorough cleaning checklist for villa turnover or deep cleaning",
    category: "Housekeeping",
    items: [
      { id: 1, title: "Complete standard room cleaning", completed: false },
      { id: 2, title: "Deep clean carpets and upholstery", completed: false },
      { id: 3, title: "Clean behind furniture and appliances", completed: false },
      { id: 4, title: "Disinfect high-touch surfaces", completed: false },
      { id: 5, title: "Clean inside cabinets and drawers", completed: false },
      { id: 6, title: "Clean light fixtures and ceiling fans", completed: false },
      { id: 7, title: "Clean air vents and filters", completed: false },
      { id: 8, title: "Polish all wooden furniture", completed: false },
      { id: 9, title: "Deep clean kitchen appliances", completed: false }
    ],
    createdBy: "System",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: "3",
    name: "Linen & Towel Change",
    description: "Mid-stay fresh linen and towel replacement",
    category: "Housekeeping",
    items: [
      { id: 1, title: "Replace all bed linens", completed: false },
      { id: 2, title: "Replace bath towels", completed: false },
      { id: 3, title: "Replace hand towels and washcloths", completed: false },
      { id: 4, title: "Replace kitchen towels", completed: false },
      { id: 5, title: "Make bed with fresh linens", completed: false },
      { id: 6, title: "Quick bathroom cleanup", completed: false },
      { id: 7, title: "Restock toiletries as needed", completed: false }
    ],
    createdBy: "System",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  // Maintenance Templates
  {
    id: "4",
    name: "Air Conditioning Maintenance",
    description: "Regular A/C system inspection and maintenance",
    category: "Maintenance",
    items: [
      { id: 1, title: "Check thermostat functionality", completed: false },
      { id: 2, title: "Replace or clean air filters", completed: false },
      { id: 3, title: "Clean condenser and evaporator coils", completed: false },
      { id: 4, title: "Check refrigerant levels", completed: false },
      { id: 5, title: "Inspect electrical connections", completed: false },
      { id: 6, title: "Clean drain lines and pans", completed: false },
      { id: 7, title: "Test system operation in both cooling and heating modes", completed: false }
    ],
    createdBy: "System",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: "5",
    name: "Pool Maintenance",
    description: "Regular swimming pool inspection and maintenance",
    category: "Maintenance",
    items: [
      { id: 1, title: "Test water pH and chemical levels", completed: false },
      { id: 2, title: "Add appropriate chemicals as needed", completed: false },
      { id: 3, title: "Clean pool filters", completed: false },
      { id: 4, title: "Skim surface for debris", completed: false },
      { id: 5, title: "Vacuum pool bottom", completed: false },
      { id: 6, title: "Brush pool walls", completed: false },
      { id: 7, title: "Check pump and heating system", completed: false },
      { id: 8, title: "Empty skimmer baskets", completed: false }
    ],
    createdBy: "System",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: "6",
    name: "General Property Inspection",
    description: "Routine inspection of property condition and safety features",
    category: "Maintenance",
    items: [
      { id: 1, title: "Check all light fixtures and replace bulbs as needed", completed: false },
      { id: 2, title: "Test smoke and carbon monoxide detectors", completed: false },
      { id: 3, title: "Inspect plumbing for leaks", completed: false },
      { id: 4, title: "Test all electrical outlets", completed: false },
      { id: 5, title: "Check door and window locks", completed: false },
      { id: 6, title: "Inspect interior and exterior walls for damage", completed: false },
      { id: 7, title: "Check roof and gutters", completed: false },
      { id: 8, title: "Inspect appliances for proper function", completed: false }
    ],
    createdBy: "System",
    createdAt: new Date().toISOString(),
    isDefault: true
  },
  {
    id: "7",
    name: "Welcome Setup",
    description: "Prepare villa for guest arrival",
    category: "Welcome",
    items: [
      { id: 1, title: "Set welcome temperature (24°C/75°F)", completed: false },
      { id: 2, title: "Place welcome gift basket", completed: false },
      { id: 3, title: "Turn on exterior lights", completed: false },
      { id: 4, title: "Stock refrigerator with welcome package", completed: false },
      { id: 5, title: "Place welcome letter and villa information", completed: false },
      { id: 6, title: "Test all electronics and WiFi", completed: false },
      { id: 7, title: "Arrange fresh flowers", completed: false },
      { id: 8, title: "Turn on pool lights and water features", completed: false }
    ],
    createdBy: "System",
    createdAt: new Date().toISOString(),
    isDefault: true
  }
];

// For backward compatibility with hooks that expect initialChecklistTemplates
export const initialChecklistTemplates = checklistTemplates;
