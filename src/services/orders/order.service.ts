
import { BaseService } from "../base/base.service";
import { Order, OrderStatus } from "@/components/inventory/orders/OrderUtils";
import { toastService } from "../toast/toast.service";
import { User } from "@/types/auth";

/**
 * Order Service
 * 
 * Handles all operations related to purchase orders
 */
export class OrderService extends BaseService<Order> {
  constructor() {
    super('orders');
  }
  
  /**
   * Create a new order
   */
  async createOrder(orderData: Partial<Order>, currentUser: User | null): Promise<Order> {
    try {
      // Generate a unique order ID
      const orderId = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Create the order with proper type checking for all properties
      const newOrder = await this.create({
        ...orderData,
        id: orderId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        requesterRole: currentUser?.role || 'concierge',
      });
      
      toastService.success('Order Created', {
        description: `Purchase order ${orderId} has been created.`
      });
      
      return newOrder;
    } catch (error) {
      toastService.error('Error Creating Order', {
        description: 'There was an error creating the order. Please try again.'
      });
      throw error;
    }
  }
  
  /**
   * Update an order's status
   */
  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    user: User | null,
    reason?: string
  ): Promise<Order> {
    try {
      const now = new Date().toISOString();
      const updateData: Partial<Order> = { status };
      
      // Add user-specific data based on the new status
      switch (status) {
        case 'manager_approved':
          updateData.managerApprovedBy = user?.name;
          updateData.managerApprovedAt = now;
          break;
        case 'approved':
          updateData.adminApprovedBy = user?.name;
          updateData.adminApprovedAt = now;
          break;
        case 'rejected':
          updateData.rejectedBy = user?.name;
          updateData.rejectedAt = now;
          updateData.rejectionReason = reason;
          break;
        case 'sent':
          updateData.sentAt = now;
          break;
        // Removed 'received' case as it's not in OrderStatus type
      }
      
      // Update the order
      const updatedOrder = await this.update(orderId, updateData);
      
      // Show appropriate toast notification
      const statusMessages = {
        manager_approved: 'Order Approved by Manager',
        approved: 'Order Approved',
        rejected: 'Order Rejected',
        sent: 'Order Sent to Vendor',
        pending: 'Order Status Updated',
        pending_24h: 'Order Status Updated',
      };
      
      toastService.success(statusMessages[status], {
        description: `Purchase order ${orderId} has been ${status}.`
      });
      
      return updatedOrder;
    } catch (error) {
      toastService.error('Error Updating Order', {
        description: 'There was an error updating the order status. Please try again.'
      });
      throw error;
    }
  }
  
  /**
   * Get all orders that are pending for more than 24 hours
   */
  async getPendingOverdueOrders(): Promise<Order[]> {
    const allOrders = await this.getAll();
    const now = new Date().getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    
    return allOrders.filter(order => {
      if (order.status !== 'pending') return false;
      
      const createdAt = new Date(order.createdAt).getTime();
      return (now - createdAt) > twentyFourHoursInMs;
    });
  }
}

// Export a singleton instance
export const orderService = new OrderService();
