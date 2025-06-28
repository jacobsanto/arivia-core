
// Mock data for dashboard
export const mockTaskData = [
  {
    id: '1',
    title: 'Clean Villa A',
    description: 'Standard cleaning after checkout',
    status: 'completed',
    priority: 'medium',
    due_date: '2024-01-15',
    assigned_to: 'Maria',
    property: 'Villa Santorini'
  },
  {
    id: '2',
    title: 'Maintenance Check',
    description: 'Weekly maintenance inspection',
    status: 'pending',
    priority: 'high',
    due_date: '2024-01-16',
    assigned_to: 'John',
    property: 'Villa Mykonos'
  },
  {
    id: '3',
    title: 'Inventory Restock',
    description: 'Restock cleaning supplies',
    status: 'in_progress',
    priority: 'low',
    due_date: '2024-01-17',
    assigned_to: 'Anna',
    property: 'Villa Crete'
  }
];

export const mockBookingData = [
  {
    id: 'booking-1',
    guest_name: 'John Smith',
    check_in: '2024-01-10',
    check_out: '2024-01-15',
    total_price: 1200,
    property: 'Villa Santorini',
    status: 'confirmed'
  },
  {
    id: 'booking-2',
    guest_name: 'Maria Garcia',
    check_in: '2024-01-12',
    check_out: '2024-01-18',
    total_price: 1800,
    property: 'Villa Mykonos',
    status: 'confirmed'
  },
  {
    id: 'booking-3',
    guest_name: 'Peter Johnson',
    check_in: '2024-01-20',
    check_out: '2024-01-25',
    total_price: 1500,
    property: 'Villa Crete',
    status: 'pending'
  }
];

export const mockInventoryData = [
  {
    id: '1',
    name: 'Toilet Paper',
    category: 'Bathroom Supplies',
    quantity: 24,
    min_quantity: 10,
    unit: 'rolls',
    last_updated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Towels',
    category: 'Linens',
    quantity: 15,
    min_quantity: 8,
    unit: 'pieces',
    last_updated: '2024-01-14'
  },
  {
    id: '3',
    name: 'Cleaning Spray',
    category: 'Cleaning Supplies',
    quantity: 5,
    min_quantity: 12,
    unit: 'bottles',
    last_updated: '2024-01-13'
  }
];
