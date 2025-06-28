
import { TaskRecord } from './taskUtils';

// Mock data for dashboard
export const mockTaskData: TaskRecord[] = [
  {
    id: '1',
    title: 'Clean Villa A - Room 101',
    status: 'pending',
    priority: 'high',
    due_date: '2024-01-15',
    assigned_to: 'Maria',
    location: 'Villa A',
    property_id: 'villa-a',
    created_at: '2024-01-10'
  },
  {
    id: '2',
    title: 'Maintenance Check - Pool',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2024-01-16',
    assigned_to: 'John',
    location: 'Pool Area',
    property_id: 'villa-b',
    created_at: '2024-01-11'
  }
];

export const mockBookingData = [
  {
    id: '1',
    property_id: 'villa-a',
    guest_name: 'John Doe',
    check_in: '2024-01-15',
    check_out: '2024-01-20',
    total_price: 1200,
    status: 'confirmed'
  },
  {
    id: '2',
    property_id: 'villa-b',
    guest_name: 'Jane Smith',
    check_in: '2024-01-18',
    check_out: '2024-01-25',
    total_price: 1800,
    status: 'confirmed'
  }
];

export const mockInventoryData = [
  {
    id: '1',
    name: 'Toilet Paper',
    category: 'Bathroom Supplies',
    quantity: 24,
    min_quantity: 10,
    status: 'in_stock'
  },
  {
    id: '2',
    name: 'Towels',
    category: 'Linens',
    quantity: 5,
    min_quantity: 8,
    status: 'low_stock'
  }
];
