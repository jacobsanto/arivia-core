
import { channelService } from './channel.service';
import { messageService } from './message.service';
import { directMessageService } from './direct-message.service';
import { 
  ChatChannel,
  ChatMessage,
  DirectMessage,
  GENERAL_CHAT_CHANNEL_ID
} from './chat.types';

// Re-export types
export type { 
  ChatChannel,
  ChatMessage,
  DirectMessage
};

// Create a consolidated service
export const chatService = {
  // Channels
  getChannels: channelService.getChannels,
  createChannel: channelService.createChannel,
  getOrCreateGeneralChannel: channelService.getOrCreateGeneralChannel,
  
  // Messages
  getChannelMessages: messageService.getChannelMessages,
  sendChannelMessage: messageService.sendChannelMessage,
  markAsRead: messageService.markAsRead,
  
  // Direct Messages
  getDirectMessages: directMessageService.getDirectMessages,
  sendDirectMessage: directMessageService.sendDirectMessage,
  markDirectMessageAsRead: directMessageService.markDirectMessageAsRead,
  getUnreadMessageCounts: directMessageService.getUnreadMessageCounts
};

// Export the general channel ID
export { GENERAL_CHAT_CHANNEL_ID };
