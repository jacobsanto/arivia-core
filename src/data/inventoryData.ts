
export const getItemsByVendor = (vendorId: string) => {
  // Mock data - replace with actual data fetching
  return [
    { id: "1", name: "Cleaning Supplies", category: "housekeeping" },
    { id: "2", name: "Toilet Paper", category: "housekeeping" },
    { id: "3", name: "Towels", category: "housekeeping" },
  ];
};

export const inventoryData = [
  { id: "1", name: "Toilet Paper", category: "Housekeeping", stock: 24, minStock: 10 },
  { id: "2", name: "Towels", category: "Housekeeping", stock: 15, minStock: 8 },
  { id: "3", name: "Cleaning Spray", category: "Housekeeping", stock: 5, minStock: 12 },
  { id: "4", name: "Light Bulbs", category: "Maintenance", stock: 18, minStock: 6 },
];

export const inventoryUsageData = [
  { id: "1", item: "Toilet Paper", quantity: 4, property: "Villa A", date: "2024-03-15", reportedBy: "Maria" },
  { id: "2", item: "Towels", quantity: 2, property: "Villa B", date: "2024-03-15", reportedBy: "John" },
  { id: "3", item: "Cleaning Spray", quantity: 1, property: "Villa A", date: "2024-03-14", reportedBy: "Sofia" },
];
