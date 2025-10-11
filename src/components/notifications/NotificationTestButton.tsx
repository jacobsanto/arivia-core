import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { notificationDemo } from '@/utils/notificationDemo';
import { useAuth } from '@/contexts/AuthContext';
import { useToastService } from '@/contexts/ToastContext';

/**
 * Test button to demonstrate the notification system
 * This component can be added to any page for testing notifications
 */
export const NotificationTestButton: React.FC = () => {
  const { user } = useAuth();
  const toast = useToastService();

  const handleCreateDemoNotifications = async () => {
    if (!user?.id) {
      toast.error('Please log in to test notifications');
      return;
    }

    try {
      toast.info('Creating demo notifications...');
      await notificationDemo.createDemoNotifications(user.id);
      toast.success('Demo notifications created! Check your notification center.');
    } catch (error) {
      console.error('Error creating demo notifications:', error);
      toast.error('Failed to create demo notifications');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      onClick={handleCreateDemoNotifications}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Bell className="h-4 w-4" />
      Test Notifications
    </Button>
  );
};

export default NotificationTestButton;