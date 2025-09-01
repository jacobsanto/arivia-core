import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Clipboard, 
  AlertTriangle, 
  Package, 
  MessageSquare, 
  ShoppingCart, 
  Wrench,
  Bell,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationType, NotificationIconConfig } from '@/types/notifications.types';

const notificationIcons: Record<NotificationType, NotificationIconConfig> = {
  task_assigned: { icon: Clipboard, className: 'text-blue-600' },
  task_completed: { icon: CheckCircle2, className: 'text-green-600' },
  damage_report: { icon: AlertTriangle, className: 'text-red-600' },
  low_stock: { icon: Package, className: 'text-orange-600' },
  chat_mention: { icon: MessageSquare, className: 'text-purple-600' },
  order_status: { icon: ShoppingCart, className: 'text-indigo-600' },
  maintenance_request: { icon: Wrench, className: 'text-yellow-600' },
  system_alert: { icon: AlertCircle, className: 'text-red-600' },
  integration_status: { icon: Bell, className: 'text-gray-600' }
};

interface NotificationCenterProps {
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate to the linked page if available
    if (notification.link) {
      navigate(notification.link, { 
        state: notification.data || {} 
      });
      onClose?.();
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const iconConfig = notificationIcons[notification.type];
    const IconComponent = iconConfig.icon;

    return (
      <div
        onClick={() => handleNotificationClick(notification)}
        className={`flex items-start space-x-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/30 ${
          !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
        }`}
      >
        <div className={`flex-shrink-0 ${iconConfig.className}`}>
          <IconComponent className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground truncate">
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="ml-2 h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {getTimeAgo(notification.created_at)}
            </span>
            
            <Badge variant="secondary" className="text-xs">
              {notification.type.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-card border border-border rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-96">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No new notifications right now.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              navigate('/notifications');
              onClose?.();
            }}
            className="w-full text-primary hover:text-primary-foreground hover:bg-primary"
          >
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;