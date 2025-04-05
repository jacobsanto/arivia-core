
// Inventory stock data
export const inventoryData = [
  { id: 1, name: 'Hand Towels', category: 'Linens & Towels', location: 'main', currentStock: 145, minLevel: 50 },
  { id: 2, name: 'Bath Towels', category: 'Linens & Towels', location: 'main', currentStock: 87, minLevel: 40 },
  { id: 3, name: 'Toilet Paper', category: 'Bathroom Supplies', location: 'main', currentStock: 215, minLevel: 100 },
  { id: 4, name: 'Laundry Detergent', category: 'Cleaning Supplies', location: 'main', currentStock: 5, minLevel: 10 },
  { id: 5, name: 'Bath Soap', category: 'Bathroom Supplies', location: 'main', currentStock: 124, minLevel: 50 },
  { id: 6, name: 'Shampoo', category: 'Bathroom Supplies', location: 'main', currentStock: 98, minLevel: 50 },
  { id: 7, name: 'Conditioner', category: 'Bathroom Supplies', location: 'main', currentStock: 87, minLevel: 50 },
  { id: 8, name: 'Kitchen Cleaner', category: 'Cleaning Supplies', location: 'main', currentStock: 32, minLevel: 15 },
  { id: 9, name: 'Glass Cleaner', category: 'Cleaning Supplies', location: 'main', currentStock: 27, minLevel: 10 },
  { id: 10, name: 'Coffee Pods', category: 'Kitchen Supplies', location: 'main', currentStock: 210, minLevel: 100 },
  
  // Property inventory levels
  { id: 11, name: 'Hand Towels', category: 'Linens & Towels', location: 'villa_caldera', currentStock: 24, minLevel: 15 },
  { id: 12, name: 'Bath Towels', category: 'Linens & Towels', location: 'villa_caldera', currentStock: 18, minLevel: 10 },
  { id: 13, name: 'Toilet Paper', category: 'Bathroom Supplies', location: 'villa_caldera', currentStock: 32, minLevel: 20 },
  { id: 14, name: 'Bath Soap', category: 'Bathroom Supplies', location: 'villa_caldera', currentStock: 42, minLevel: 20 },

  { id: 15, name: 'Hand Towels', category: 'Linens & Towels', location: 'villa_oceana', currentStock: 28, minLevel: 15 },
  { id: 16, name: 'Bath Towels', category: 'Linens & Towels', location: 'villa_oceana', currentStock: 22, minLevel: 10 },
  { id: 17, name: 'Toilet Paper', category: 'Bathroom Supplies', location: 'villa_oceana', currentStock: 36, minLevel: 20 },
  { id: 18, name: 'Bath Soap', category: 'Bathroom Supplies', location: 'villa_oceana', currentStock: 38, minLevel: 20 },
  
  { id: 19, name: 'Hand Towels', category: 'Linens & Towels', location: 'villa_azure', currentStock: 18, minLevel: 15 },
  { id: 20, name: 'Bath Towels', category: 'Linens & Towels', location: 'villa_azure', currentStock: 14, minLevel: 10 },
  { id: 21, name: 'Toilet Paper', category: 'Bathroom Supplies', location: 'villa_azure', currentStock: 3, minLevel: 20 },
  { id: 22, name: 'Bath Soap', category: 'Bathroom Supplies', location: 'villa_azure', currentStock: 22, minLevel: 20 },
  
  { id: 23, name: 'Hand Towels', category: 'Linens & Towels', location: 'villa_sunset', currentStock: 22, minLevel: 15 },
  { id: 24, name: 'Bath Towels', category: 'Linens & Towels', location: 'villa_sunset', currentStock: 17, minLevel: 10 },
  { id: 25, name: 'Toilet Paper', category: 'Bathroom Supplies', location: 'villa_sunset', currentStock: 28, minLevel: 20 },
  { id: 26, name: 'Bath Soap', category: 'Bathroom Supplies', location: 'villa_sunset', currentStock: 31, minLevel: 20 },
  
  { id: 27, name: 'Hand Towels', category: 'Linens & Towels', location: 'villa_paradiso', currentStock: 0, minLevel: 15 },
  { id: 28, name: 'Bath Towels', category: 'Linens & Towels', location: 'villa_paradiso', currentStock: 11, minLevel: 10 },
  { id: 29, name: 'Toilet Paper', category: 'Bathroom Supplies', location: 'villa_paradiso', currentStock: 24, minLevel: 20 },
  { id: 30, name: 'Bath Soap', category: 'Bathroom Supplies', location: 'villa_paradiso', currentStock: 0, minLevel: 20 },
];

// Inventory usage history data
export const inventoryUsageData = [
  { id: 1, date: '2025-04-04', property: 'villa_caldera', item: 'Hand Towels', category: 'Linens', quantity: 8, reportedBy: 'Maria K.' },
  { id: 2, date: '2025-04-04', property: 'villa_caldera', item: 'Bath Soap', category: 'Bathroom', quantity: 12, reportedBy: 'Maria K.' },
  { id: 3, date: '2025-04-03', property: 'villa_oceana', item: 'Toilet Paper', category: 'Bathroom', quantity: 6, reportedBy: 'Thomas L.' },
  { id: 4, date: '2025-04-03', property: 'villa_oceana', item: 'Shampoo', category: 'Bathroom', quantity: 10, reportedBy: 'Thomas L.' },
  { id: 5, date: '2025-04-02', property: 'villa_azure', item: 'Laundry Detergent', category: 'Cleaning', quantity: 2, reportedBy: 'Ana R.' },
  { id: 6, date: '2025-04-02', property: 'villa_sunset', item: 'Kitchen Cleaner', category: 'Cleaning', quantity: 1, reportedBy: 'Stefan M.' },
  { id: 7, date: '2025-04-01', property: 'villa_paradiso', item: 'Hand Towels', category: 'Linens', quantity: 12, reportedBy: 'Julia P.' },
  { id: 8, date: '2025-04-01', property: 'villa_caldera', item: 'Coffee Pods', category: 'Kitchen', quantity: 20, reportedBy: 'Maria K.' },
  { id: 9, date: '2025-03-31', property: 'villa_oceana', item: 'Bath Towels', category: 'Linens', quantity: 6, reportedBy: 'Thomas L.' },
  { id: 10, date: '2025-03-31', property: 'villa_azure', item: 'Toilet Paper', category: 'Bathroom', quantity: 8, reportedBy: 'Ana R.' },
  { id: 11, date: '2025-03-30', property: 'villa_sunset', item: 'Bath Soap', category: 'Bathroom', quantity: 14, reportedBy: 'Stefan M.' },
  { id: 12, date: '2025-03-30', property: 'villa_paradiso', item: 'Glass Cleaner', category: 'Cleaning', quantity: 2, reportedBy: 'Julia P.' },
];
