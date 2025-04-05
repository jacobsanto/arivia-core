
/**
 * Utility functions for the Order Management feature
 */

// Generate a new order ID based on year and sequence number
export const generateOrderId = (currentYear: number, currentSequence: number) => {
  return `PO-${currentYear}-${currentSequence.toString().padStart(3, '0')}`;
};

// Format a date to a friendly string
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Calculate the total number of items in an order
export const calculateTotalItems = (items: { quantity: number }[]) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

// Check if a user has the required role to perform an action
export const hasPermission = (userRole: string, allowedRoles: string[]) => {
  return allowedRoles.includes(userRole);
};

// Validate order data
export const validateOrder = (order: any) => {
  const errors: string[] = [];
  
  if (!order.vendorId) {
    errors.push("Vendor is required");
  }
  
  if (!order.date) {
    errors.push("Date is required");
  }
  
  if (!order.items || order.items.length === 0) {
    errors.push("At least one item is required");
  } else {
    const invalidItems = order.items.filter((item: any) => !item.itemId || item.quantity < 1);
    if (invalidItems.length > 0) {
      errors.push("All items must have a valid item selected and quantity greater than zero");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export order status type for reuse
export type OrderStatus = "pending" | "approved" | "rejected" | "sent";

// Export order item type for reuse
export type OrderItem = {
  itemId: string;
  name: string;
  quantity: number;
};

// Export order type for reuse
export type Order = {
  id: string;
  vendorId: string;
  vendorName: string;
  date: string;
  requestor: string;
  status: OrderStatus;
  items: OrderItem[];
  notes: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  sentAt?: string;
};
