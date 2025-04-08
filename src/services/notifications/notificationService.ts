
export interface UserNotification {
  id: string;
  type: "new_user" | "role_updated" | "system";
  title: string;
  message: string;
  createdAt: number;
  userId?: string;
  read: boolean;
}

// Get notifications from localStorage
export const getUserNotifications = (): UserNotification[] => {
  const storedNotifications = localStorage.getItem("adminNotifications");
  return storedNotifications ? JSON.parse(storedNotifications) : [];
};

// Add a new notification
export const addUserNotification = (notification: UserNotification): void => {
  const notifications = getUserNotifications();
  notifications.push(notification);
  
  // Sort notifications by date (newest first)
  notifications.sort((a, b) => b.createdAt - a.createdAt);
  
  // Save to localStorage
  localStorage.setItem("adminNotifications", JSON.stringify(notifications));
};

// Mark a notification as read
export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getUserNotifications();
  const updatedNotifications = notifications.map(notif => 
    notif.id === notificationId ? { ...notif, read: true } : notif
  );
  
  localStorage.setItem("adminNotifications", JSON.stringify(updatedNotifications));
};

// Delete a notification
export const deleteNotification = (notificationId: string): void => {
  const notifications = getUserNotifications();
  const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
  
  localStorage.setItem("adminNotifications", JSON.stringify(updatedNotifications));
};

// Get unread notification count
export const getUnreadNotificationCount = (): number => {
  const notifications = getUserNotifications();
  return notifications.filter(notif => !notif.read).length;
};

// Get pending user count
export const getPendingUserCount = (): number => {
  const notifications = getUserNotifications();
  return notifications.filter(notif => notif.type === "new_user" && !notif.read).length;
};
