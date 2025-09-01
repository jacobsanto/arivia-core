export type NotificationType = 
  | 'task_assigned'
  | 'task_completed' 
  | 'damage_report'
  | 'low_stock'
  | 'chat_mention'
  | 'order_status'
  | 'maintenance_request'
  | 'system_alert'
  | 'integration_status';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}