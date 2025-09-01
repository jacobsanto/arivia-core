import { notificationService } from './notification.service';
import { NotificationType, CreateNotificationData } from '@/types/notifications.types';

/**
 * Notification Patterns - Event-driven notification generation for different modules
 * This follows the analysis pattern of generating notifications based on system events
 */
export class NotificationPatterns {
  
  /**
   * Task Assignment - When a manager assigns a task to staff
   */
  static async taskAssigned(data: {
    userId: string;
    taskTitle: string;
    taskType: string;
    taskId: string;
    assignedBy: string;
    dueDate?: string;
  }) {
    const notificationData: CreateNotificationData = {
      user_id: data.userId,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new ${data.taskType} task: "${data.taskTitle}"${data.dueDate ? ` (Due: ${data.dueDate})` : ''}`,
      link: `/tasks/${data.taskId}`,
      data: {
        taskId: data.taskId,
        taskType: data.taskType,
        assignedBy: data.assignedBy
      }
    };

    return await notificationService.createNotification(notificationData);
  }

  /**
   * Task Completion - When a task is completed
   */
  static async taskCompleted(data: {
    managerIds: string[];
    taskTitle: string;
    taskType: string;
    taskId: string;
    completedBy: string;
  }) {
    const notifications = data.managerIds.map(managerId => ({
      user_id: managerId,
      type: 'task_completed' as NotificationType,
      title: 'Task Completed',
      message: `${data.taskType} task "${data.taskTitle}" has been completed by ${data.completedBy}`,
      link: `/tasks/${data.taskId}`,
      data: {
        taskId: data.taskId,
        taskType: data.taskType,
        completedBy: data.completedBy
      }
    }));

    return await Promise.all(
      notifications.map(notification => notificationService.createNotification(notification))
    );
  }

  /**
   * Damage Report Filed - When a new damage report is submitted
   */
  static async damageReportFiled(data: {
    managerIds: string[];
    propertyName: string;
    reportId: string;
    filedBy: string;
    severity: string;
  }) {
    const notifications = data.managerIds.map(managerId => ({
      user_id: managerId,
      type: 'damage_report' as NotificationType,
      title: 'New Damage Report',
      message: `New ${data.severity} damage report filed for ${data.propertyName} by ${data.filedBy}`,
      link: `/damage-reports/${data.reportId}`,
      data: {
        reportId: data.reportId,
        propertyName: data.propertyName,
        severity: data.severity,
        filedBy: data.filedBy
      }
    }));

    return await Promise.all(
      notifications.map(notification => notificationService.createNotification(notification))
    );
  }

  /**
   * Low Stock Alert - When inventory falls below threshold
   */
  static async lowStockAlert(data: {
    managerIds: string[];
    itemName: string;
    currentStock: number;
    minQuantity: number;
    location: string;
  }) {
    const notifications = data.managerIds.map(managerId => ({
      user_id: managerId,
      type: 'low_stock' as NotificationType,
      title: 'Low Stock Alert',
      message: `${data.itemName} is running low (${data.currentStock}/${data.minQuantity}) at ${data.location}`,
      link: '/inventory',
      data: {
        itemName: data.itemName,
        currentStock: data.currentStock,
        minQuantity: data.minQuantity,
        location: data.location
      }
    }));

    return await Promise.all(
      notifications.map(notification => notificationService.createNotification(notification))
    );
  }

  /**
   * Chat Mention - When a user is mentioned in team chat
   */
  static async chatMention(data: {
    userId: string;
    mentionedBy: string;
    channelName: string;
    messagePreview: string;
    messageId: string;
  }) {
    const notificationData: CreateNotificationData = {
      user_id: data.userId,
      type: 'chat_mention',
      title: `Mentioned in #${data.channelName}`,
      message: `${data.mentionedBy}: ${data.messagePreview.substring(0, 100)}${data.messagePreview.length > 100 ? '...' : ''}`,
      link: `/team-chat?channel=${data.channelName}&message=${data.messageId}`,
      data: {
        channelName: data.channelName,
        mentionedBy: data.mentionedBy,
        messageId: data.messageId
      }
    };

    return await notificationService.createNotification(notificationData);
  }

  /**
   * Order Status Change - When purchase order status changes
   */
  static async orderStatusChange(data: {
    requesterIds: string[];
    orderId: string;
    newStatus: string;
    orderDescription: string;
    actionBy?: string;
  }) {
    const notifications = data.requesterIds.map(requesterId => ({
      user_id: requesterId,
      type: 'order_status' as NotificationType,
      title: 'Order Status Update',
      message: `Purchase order "${data.orderDescription}" is now ${data.newStatus}${data.actionBy ? ` by ${data.actionBy}` : ''}`,
      link: `/orders/${data.orderId}`,
      data: {
        orderId: data.orderId,
        newStatus: data.newStatus,
        actionBy: data.actionBy
      }
    }));

    return await Promise.all(
      notifications.map(notification => notificationService.createNotification(notification))
    );
  }

  /**
   * Maintenance Request - When maintenance is needed
   */
  static async maintenanceRequest(data: {
    maintenanceStaffIds: string[];
    propertyName: string;
    requestId: string;
    priority: string;
    description: string;
  }) {
    const notifications = data.maintenanceStaffIds.map(staffId => ({
      user_id: staffId,
      type: 'maintenance_request' as NotificationType,
      title: 'Maintenance Request',
      message: `${data.priority} priority maintenance needed at ${data.propertyName}: ${data.description}`,
      link: `/maintenance/${data.requestId}`,
      data: {
        requestId: data.requestId,
        propertyName: data.propertyName,
        priority: data.priority
      }
    }));

    return await Promise.all(
      notifications.map(notification => notificationService.createNotification(notification))
    );
  }

  /**
   * System Alert - For system-wide announcements
   */
  static async systemAlert(data: {
    userIds: string[];
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    link?: string;
  }) {
    const notifications = data.userIds.map(userId => ({
      user_id: userId,
      type: 'system_alert' as NotificationType,
      title: data.title,
      message: data.message,
      link: data.link,
      data: {
        severity: data.severity
      }
    }));

    return await Promise.all(
      notifications.map(notification => notificationService.createNotification(notification))
    );
  }

  /**
   * Integration Status - When external integrations have issues
   */
  static async integrationStatus(data: {
    adminIds: string[];
    integrationName: string;
    status: 'connected' | 'disconnected' | 'error';
    message: string;
  }) {
    const notifications = data.adminIds.map(adminId => ({
      user_id: adminId,
      type: 'integration_status' as NotificationType,
      title: `${data.integrationName} Integration`,
      message: data.message,
      link: '/admin/integrations',
      data: {
        integrationName: data.integrationName,
        status: data.status
      }
    }));

    return await Promise.all(
      notifications.map(notification => notificationService.createNotification(notification))
    );
  }
}

export default NotificationPatterns;