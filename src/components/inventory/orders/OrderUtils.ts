
import { UserRole } from "@/types/auth";

export type OrderStatus = 
  | "pending" 
  | "pending_24h" 
  | "manager_approved" 
  | "approved" 
  | "rejected" 
  | "sent";

export type OrderPriority = "low" | "medium" | "high" | "urgent";

export interface Order {
  id: string;
  vendorName: string;
  vendorId: string;
  date: string;
  requestor: string;
  requesterRole: string;
  priority: OrderPriority;
  department: "housekeeping" | "maintenance" | "general";
  status: OrderStatus;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
  }>;
  notes?: string;
  createdAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  adminApprovedBy?: string;
  adminApprovedAt?: string;
  sentAt?: string;
}

export type VendorStatus = "active" | "inactive" | "pending";

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: VendorStatus;
  category: string;
  categories: string[];
  contactPerson?: string;
  paymentTerms?: string;
  notes?: string;
}

export const canEditOrderStatus = (userRole: UserRole, orderStatus: string): boolean => {
  // Superadmin and tenant admin can edit any order
  if (userRole === 'superadmin' || userRole === 'tenant_admin') {
    return true;
  }
  
  // Property managers can edit pending and in-progress orders
  if (userRole === 'property_manager') {
    return ['pending', 'in_progress'].includes(orderStatus);
  }
  
  // Inventory managers can edit pending orders
  if (userRole === 'inventory_manager') {
    return orderStatus === 'pending';
  }
  
  return false;
};

export const canViewOrderDetails = (userRole: UserRole): boolean => {
  const authorizedRoles: UserRole[] = [
    'superadmin',
    'tenant_admin', 
    'property_manager',
    'inventory_manager'
  ];
  
  return authorizedRoles.includes(userRole);
};

export const getOrderActionsForRole = (userRole: UserRole, orderStatus: string): string[] => {
  const actions: string[] = [];
  
  if (canEditOrderStatus(userRole, orderStatus)) {
    actions.push('edit', 'cancel');
  }
  
  if (canViewOrderDetails(userRole)) {
    actions.push('view');
  }
  
  // Superadmin and tenant admin can delete orders
  if (userRole === 'superadmin' || userRole === 'tenant_admin') {
    actions.push('delete');
  }
  
  return actions;
};

export const canTakeActionOnOrder = (orderStatus: OrderStatus, userRole: UserRole): boolean => {
  if (userRole === 'superadmin') return true;
  
  if (userRole === 'tenant_admin') {
    return ['pending', 'manager_approved', 'pending_24h'].includes(orderStatus);
  }
  
  if (userRole === 'property_manager') {
    return orderStatus === 'pending';
  }
  
  return false;
};

export const getNextOrderStatus = (currentStatus: OrderStatus, userRole: UserRole): OrderStatus => {
  if (userRole === 'superadmin') {
    if (currentStatus === 'pending' || currentStatus === 'pending_24h') return 'approved';
    if (currentStatus === 'manager_approved') return 'approved';
  }
  
  if (userRole === 'tenant_admin') {
    if (currentStatus === 'manager_approved' || currentStatus === 'pending_24h') return 'approved';
  }
  
  if (userRole === 'property_manager') {
    if (currentStatus === 'pending') return 'manager_approved';
  }
  
  return currentStatus;
};

export const sendOrderNotification = (status: OrderStatus, orderId: string, orderData?: any) => {
  // This would integrate with your notification system
  console.log(`Order ${orderId} status changed to ${status}`, orderData);
};
