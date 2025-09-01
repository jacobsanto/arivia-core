// Main exports for the notification system
export { notificationService } from './notification.service';
export { NotificationPatterns } from './notification.patterns';

// Types
export type {
  Notification,
  NotificationType,
  CreateNotificationData,
  NotificationState,
  NotificationIconConfig
} from '@/types/notifications.types';

// Hooks
export { useNotifications } from '@/hooks/useNotifications';

// Components
export { default as NotificationCenter } from '@/components/notifications/NotificationCenter';
export { default as NotificationTestButton } from '@/components/notifications/NotificationTestButton';

// Demo utilities
export { notificationDemo } from '@/utils/notificationDemo';