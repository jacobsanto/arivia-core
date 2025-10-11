import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notifications/notification.service';
import { Notification } from '@/types/notifications.types';
import { logger } from '@/services/logger';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading, refetch } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.link) {
      navigate(notification.link, { 
        state: notification.data || {} 
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      refetch();
    } catch (error) {
      logger.error('Error deleting notification', { error });
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            Mark all as read
          </Button>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start justify-between p-6 hover:bg-accent/50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full" />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(notification.created_at)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      className="ml-4 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;