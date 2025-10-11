import { ChatMessage, ChatListItem, ChatUser } from '@/types/chat.types';
import { NotificationPatterns } from '@/services/notifications/notification.patterns';
import { chatUsersAPI } from './realtime-chat.service';
import { logger } from '@/services/logger';

/**
 * Generate notifications for chat events
 */
export const generateChatNotifications = async (
  message: ChatMessage, 
  activeItem: ChatListItem
) => {
  try {
    // Extract mentions from message content (looking for @username patterns)
    const mentionMatches = message.content.match(/@(\w+)/g);
    if (!mentionMatches) return;

    // Get all team members to match usernames
    const teamMembers = await chatUsersAPI.getTeamMembers();
    
    // Process each mention
    for (const mention of mentionMatches) {
      const username = mention.substring(1); // Remove @ symbol
      
      // Find user by name (case insensitive)
      const mentionedUser = teamMembers.find(
        user => user.name.toLowerCase() === username.toLowerCase()
      );
      
      if (mentionedUser && mentionedUser.id !== message.authorId) {
        // Generate mention notification
        await NotificationPatterns.chatMention({
          userId: mentionedUser.id,
          mentionedBy: message.author.name,
          channelName: activeItem.type === 'channel' 
            ? activeItem.name.replace('#', '') 
            : `DM with ${message.author.name}`,
          messagePreview: message.content,
          messageId: message.id
        });
      }
    }
  } catch (error) {
    logger.error("Error generating chat notifications", error, { component: 'chatNotificationService' });
  }
};

/**
 * Generate notification for direct messages (when not in chat window)
 */
export const generateDirectMessageNotification = async (
  message: ChatMessage,
  recipientId: string
) => {
  try {
    // This could be used for when users receive DMs while not in the chat
    // For now, we'll rely on the real-time chat notifications
    logger.debug("Direct message notification", { message, recipientId }, { component: 'chatNotificationService' });
  } catch (error) {
    logger.error("Error generating direct message notification", error, { component: 'chatNotificationService' });
  }
};