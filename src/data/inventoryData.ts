
// Placeholder inventory data until we fully implement the database connection

// Sample inventory items
export const inventoryData = [
  {
    id: "inv-1",
    name: "Hand Towels",
    category: "Bathroom Supplies",
    location: "main",
    currentStock: 120,
    minLevel: 50,
    vendor: "HomeSupplies Co."
  },
  {
    id: "inv-2",
    name: "Toilet Paper",
    category: "Bathroom Supplies",
    location: "villa_caldera",
    currentStock: 75,
    minLevel: 30,
    vendor: "HomeSupplies Co."
  }
];

// Sample inventory usage data
export const inventoryUsageData = [
  {
    id: "usage-1",
    date: "2025-04-15",
    property: "villa_caldera",
    item: "Hand Towels",
    category: "Bathroom Supplies",
    quantity: 12,
    reportedBy: "Maria K."
  },
  {
    id: "usage-2",
    date: "2025-04-14",
    property: "villa_oceana",
    item: "Toilet Paper",
    category: "Bathroom Supplies",
    quantity: 8,
    reportedBy: "John D."
  }
];

// Sample vendors data
export const vendorsData = [
  {
    id: "vendor-1",
    name: "HomeSupplies Co.",
    email: "orders@homesupplies.com",
    phone: "+30 210 1234567",
    categories: ["Bathroom Supplies", "Cleaning Products"]
  },
  {
    id: "vendor-2",
    name: "Maintenance Tools Inc.",
    email: "sales@maintenancetools.com",
    phone: "+30 210 7654321",
    categories: ["Tools", "Spare Parts"]
  }
];

// Sample categories data
export const categoriesData = [
  { id: "cat-1", name: "Bathroom Supplies", description: "Towels, toilet paper, and other bathroom items" },
  { id: "cat-2", name: "Cleaning Products", description: "Detergents, soaps, and cleaning materials" },
  { id: "cat-3", name: "Tools", description: "Maintenance and repair tools" },
  { id: "cat-4", name: "Spare Parts", description: "Replacement parts for equipment" }
];

// Helper function to get items by vendor ID
export const getItemsByVendor = (vendorId: string | null) => {
  if (!vendorId) return [];
  
  const vendor = vendorsData.find(v => v.id === vendorId);
  if (!vendor) return [];
  
  return inventoryData.filter(item => 
    vendor.categories.includes(item.category)
  ).map(item => ({
    id: item.id,
    name: item.name,
    category: item.category
  }));
};
