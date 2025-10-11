import { NotificationPatterns } from '@/services/notifications/notification.patterns';

/**
 * Demo functions to test the notification system
 * These can be called from console or triggered by UI actions
 */
export const notificationDemo = {
  
  /**
   * Demo task assignment notification
   */
  async demoTaskAssigned(userId: string) {
    return await NotificationPatterns.taskAssigned({
      userId,
      taskTitle: 'Clean Villa Santorini Master Suite',
      taskType: 'housekeeping',
      taskId: 'task-123',
      assignedBy: 'Maria K.',
      dueDate: 'Today 3:00 PM'
    });
  },

  /**
   * Demo damage report notification (for all managers)
   */
  async demoDamageReport(managerIds: string[]) {
    return await NotificationPatterns.damageReportFiled({
      managerIds,
      propertyName: 'Villa Helios Suite',
      reportId: 'damage-456',
      filedBy: 'Alex Chen',
      severity: 'high'
    });
  },

  /**
   * Demo low stock alert
   */
  async demoLowStock(managerIds: string[]) {
    return await NotificationPatterns.lowStockAlert({
      managerIds,
      itemName: 'Bathroom Towels',
      currentStock: 5,
      minQuantity: 20,
      location: 'Villa Caldera'
    });
  },

  /**
   * Demo chat mention
   */
  async demoChatMention(userId: string) {
    return await NotificationPatterns.chatMention({
      userId,
      mentionedBy: 'Stefan Müller',
      channelName: 'housekeeping',
      messagePreview: '@you Can you check the guest checkout status for Villa Azure? The guests mentioned some issues with the AC.',
      messageId: 'msg-789'
    });
  },

  /**
   * Demo order status change
   */
  async demoOrderStatus(requesterIds: string[]) {
    return await NotificationPatterns.orderStatusChange({
      requesterIds,
      orderId: 'order-321',
      newStatus: 'approved',
      orderDescription: 'Cleaning Supplies Restock',
      actionBy: 'Manager'
    });
  },

  /**
   * Demo maintenance request
   */
  async demoMaintenanceRequest(maintenanceStaffIds: string[]) {
    return await NotificationPatterns.maintenanceRequest({
      maintenanceStaffIds,
      propertyName: 'Villa Oceana',
      requestId: 'maint-654',
      priority: 'urgent',
      description: 'Pool filtration system malfunction'
    });
  },

  /**
   * Demo system alert
   */
  async demoSystemAlert(userIds: string[]) {
    return await NotificationPatterns.systemAlert({
      userIds,
      title: 'System Maintenance Scheduled',
      message: 'The system will be under maintenance tonight from 2:00 AM to 4:00 AM. Please save your work.',
      severity: 'warning',
      link: '/system-status'
    });
  },

  /**
   * Demo integration status
   */
  async demoIntegrationStatus(adminIds: string[]) {
    return await NotificationPatterns.integrationStatus({
      adminIds,
      integrationName: 'Guesty',
      status: 'error',
      message: 'Connection to Guesty API failed. Booking sync may be delayed.'
    });
  },

  /**
   * Create multiple demo notifications for testing
   */
  async createDemoNotifications(userId: string) {
    const demoFunctions = [
      () => this.demoTaskAssigned(userId),
      () => this.demoChatMention(userId),
      () => this.demoLowStock([userId]),
      () => this.demoOrderStatus([userId])
    ];

    const results = [];
    for (const demoFn of demoFunctions) {
      try {
        const result = await demoFn();
        results.push(result);
        // Add delay between notifications
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error creating demo notification:', error);
      }
    }

    return results;
  }
};

// Demo functions only available in development mode
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).notificationDemo = notificationDemo;
}