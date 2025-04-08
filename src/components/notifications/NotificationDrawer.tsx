
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCheck, UserPlus, Bell, Trash2, ArrowRight } from "lucide-react";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  deleteNotification,
  UserNotification
} from "@/services/notifications/notificationService";
import { useUser } from "@/contexts/auth/UserContext";
import { updateUserRole } from "@/services/auth/userManagementService";

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ 
  open, 
  onClose 
}) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [activeTab, setActiveTab] = useState("unread");
  const { user } = useUser();
  
  // Fetch notifications when drawer opens
  useEffect(() => {
    if (open) {
      refreshNotifications();
    }
  }, [open]);

  const refreshNotifications = () => {
    const allNotifications = getUserNotifications();
    setNotifications(allNotifications);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    refreshNotifications();
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
    refreshNotifications();
  };

  const handleApproveUser = async (notification: UserNotification) => {
    if (!notification.userId) return;
    
    // Update user role
    await updateUserRole(notification.userId, "property_manager");
    
    // Mark notification as read
    markNotificationAsRead(notification.id);
    
    refreshNotifications();
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "users") return notification.type === "new_user";
    return true; // "all" tab
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </span>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          </SheetTitle>
          <SheetDescription>
            {user?.role === "superadmin" || user?.role === "administrator" 
              ? "Manage system notifications and user approval requests"
              : "View your notifications"}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="unread" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="unread" className="relative">
              Unread
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">
              Users
              {notifications.filter(n => n.type === "new_user" && !n.read).length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {notifications.filter(n => n.type === "new_user" && !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {['unread', 'users', 'all'].map(tabValue => (
            <TabsContent value={tabValue} key={tabValue} className="mt-4 space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground opacity-40" />
                  <p className="text-muted-foreground mt-2">No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`border p-4 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {notification.type === 'new_user' ? (
                          <UserPlus className="h-5 w-5 text-blue-500 mt-1" />
                        ) : (
                          <Bell className="h-5 w-5 text-blue-500 mt-1" />
                        )}
                        
                        <div>
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Action buttons for new user notifications */}
                    {notification.type === 'new_user' && !notification.read && (
                      <div className="flex justify-end mt-3 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Dismiss
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleApproveUser(notification)}
                          className="flex items-center"
                        >
                          Approve User
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Mark as read for other notifications */}
                    {notification.type !== 'new_user' && !notification.read && (
                      <div className="flex justify-end mt-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationDrawer;
