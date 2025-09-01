import React, { useEffect, useState } from 'react';
import { ChatMessage } from '@/types/chat.types';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';

interface ChatNotificationsProps {
  messages: ChatMessage[];
  currentUserId?: string;
  isWindowFocused: boolean;
  enableNotifications: boolean;
}

export const ChatNotifications: React.FC<ChatNotificationsProps> = ({
  messages,
  currentUserId,
  isWindowFocused,
  enableNotifications
}) => {
  const { toast } = useToast();
  const { refetch } = useNotifications();
  const [lastNotifiedMessage, setLastNotifiedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!enableNotifications || isWindowFocused) return;

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.authorId === currentUserId) return;
    if (latestMessage.id === lastNotifiedMessage) return;

    // Show toast notification
    toast({
      title: latestMessage.author.name,
      description: latestMessage.content.length > 50 
        ? latestMessage.content.substring(0, 50) + '...'
        : latestMessage.content,
      action: (
        <Bell className="h-4 w-4" />
      ),
    });

    // Browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${latestMessage.author.name}`, {
        body: latestMessage.content,
        icon: '/favicon.ico',
        tag: `chat-${latestMessage.id}`,
      });
    }

    setLastNotifiedMessage(latestMessage.id);
    
    // Refresh notifications to sync with the notification system
    refetch();
  }, [messages, currentUserId, isWindowFocused, enableNotifications, lastNotifiedMessage, toast, refetch]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return null; // This component doesn't render anything
};