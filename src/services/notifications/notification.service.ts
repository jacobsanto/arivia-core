import { supabase } from '@/integrations/supabase/client';
import { Notification, CreateNotificationData } from '@/types/notifications.types';
import { logger } from '@/services/logger';

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error("Error fetching notifications", error, { component: 'notificationService' });
      throw error;
    }

    return (data || []) as Notification[];
  }

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) {
      logger.error("Error fetching unread count", error, { component: 'notificationService' });
      throw error;
    }

    return count || 0;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      logger.error("Error marking notification as read", error, { component: 'notificationService', notificationId });
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('is_read', false);

    if (error) {
      logger.error("Error marking all notifications as read", error, { component: 'notificationService' });
      throw error;
    }
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([data])
      .select()
      .single();

    if (error) {
      logger.error("Error creating notification", error, { component: 'notificationService' });
      throw error;
    }

    return notification as Notification;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      logger.error("Error deleting notification", error, { component: 'notificationService', notificationId });
      throw error;
    }
  }

  // Real-time subscription for notifications
  subscribeToNotifications(callback: (payload: any) => void) {
    return supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        callback
      )
      .subscribe();
  }
}

export const notificationService = new NotificationService();