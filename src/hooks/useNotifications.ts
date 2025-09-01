import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notifications/notification.service';
import { Notification, NotificationState } from '@/types/notifications.types';
import { useToastService } from '@/contexts/ToastContext';

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    error: null
  });

  const toast = useToastService();

  const fetchNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [notifications, unreadCount] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount()
      ]);

      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false
      }));
      toast.error('Failed to load notifications');
    }
  }, [toast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, [toast]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }));
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, [toast]);

  // Real-time subscription
  useEffect(() => {
    const channel = notificationService.subscribeToNotifications((payload) => {
      console.log('Notification change:', payload);
      
      if (payload.eventType === 'INSERT') {
        setState(prev => ({
          ...prev,
          notifications: [payload.new, ...prev.notifications],
          unreadCount: prev.unreadCount + 1
        }));
        
        // Show toast for new notifications
        if (!payload.new.is_read) {
          toast.info(payload.new.title, {
            description: payload.new.message
          });
        }
      } else if (payload.eventType === 'UPDATE') {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => 
            n.id === payload.new.id ? payload.new : n
          ),
          unreadCount: payload.old.is_read !== payload.new.is_read && payload.new.is_read
            ? Math.max(0, prev.unreadCount - 1)
            : prev.unreadCount
        }));
      } else if (payload.eventType === 'DELETE') {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== payload.old.id),
          unreadCount: payload.old.is_read ? prev.unreadCount : Math.max(0, prev.unreadCount - 1)
        }));
      }
    });

    return () => {
      if (channel) {
        notificationService.subscribeToNotifications(() => {}).unsubscribe();
      }
    };
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};