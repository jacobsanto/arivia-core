
/**
 * Utility functions for the Order Management feature
 */

import { toast } from "sonner";
import { UserRole } from "@/types/auth";

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

// Get the next status in the approval workflow
export const getNextOrderStatus = (currentStatus: OrderStatus, userRole: UserRole): OrderStatus => {
  switch (currentStatus) {
    case "pending":
      return userRole === "property_manager" ? "manager_approved" : 
             (userRole === "administrator" || userRole === "superadmin") ? "approved" : "pending";
    case "manager_approved":
      return (userRole === "administrator" || userRole === "superadmin") ? "approved" : "manager_approved";
    default:
      return currentStatus;
  }
};

// Check if user can take action on an order based on status and role
export const canTakeActionOnOrder = (status: OrderStatus, userRole: UserRole): boolean => {
  switch (status) {
    case "pending":
      return userRole === "property_manager" || userRole === "administrator" || userRole === "superadmin";
    case "manager_approved":
      return userRole === "administrator" || userRole === "superadmin";
    case "approved":
      return userRole === "superadmin"; // Only superadmin can modify an approved order
    case "rejected":
    case "sent":
      return userRole === "superadmin"; // Only superadmin can modify a rejected or sent order
    default:
      return false;
  }
};

// Generate notification message based on order status
export const getOrderNotificationMessage = (status: OrderStatus, orderId: string): string => {
  switch (status) {
    case "pending":
      return `New order ${orderId} requires your approval`;
    case "manager_approved":
      return `Order ${orderId} has been approved by manager and requires final approval`;
    case "approved":
      return `Order ${orderId} has been approved and will be sent to vendors`;
    case "rejected":
      return `Order ${orderId} has been rejected`;
    case "sent":
      return `Order ${orderId} has been sent to vendors`;
    case "pending_24h":
      return `⚠️ Order ${orderId} has been pending for over 24 hours`;
    default:
      return `Update on order ${orderId}`;
  }
};

// Send notification to appropriate users based on order status
export const sendOrderNotification = (status: OrderStatus, orderId: string, orderDetails: any) => {
  const message = getOrderNotificationMessage(status, orderId);
  
  // In a real app, this would send notifications to the appropriate users
  // For now, we'll just show a toast notification
  toast.info(message, {
    description: `Order ${orderId} is now ${status}`,
    duration: 5000
  });
  
  console.log("Notification sent:", { status, orderId, message, orderDetails });
  return true;
};

// Split an order by vendor (if it has multiple vendors)
export const splitOrderByVendor = (order: Order): Order[] => {
  // In a real app, this would split the order by vendor
  // For now, we'll just return the original order
  return [order];
};

// Export order status type for reuse
export type OrderStatus = "pending" | "manager_approved" | "approved" | "rejected" | "sent" | "pending_24h";

// Export order priority type
export type OrderPriority = "low" | "medium" | "high" | "urgent";

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
  requesterRole: UserRole;
  department: string;
  priority: OrderPriority;
  status: OrderStatus;
  items: OrderItem[];
  notes: string;
  createdAt: string;
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  adminApprovedBy?: string;
  adminApprovedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  sentAt?: string;
};

// Export vendor status type for reuse
export type VendorStatus = "active" | "inactive";

// Export vendor type for reuse
export type Vendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  categories: string[]; // Multiple categories
  address: string;
  notes: string;
  status: VendorStatus;
};
