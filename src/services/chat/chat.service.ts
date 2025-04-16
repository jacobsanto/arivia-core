
import { channelService } from './channel.service';
import { messageService } from './message.service';
import { directMessageService } from './direct-message.service';
import { 
  ChatChannel,
  ChatMessage,
  DirectMessage,
  ChatMessageDB
} from './chat.types';

// Re-export types
export type { 
  ChatChannel,
  ChatMessage,
  DirectMessage,
  ChatMessageDB
};

// Create a consolidated service
export const chatService = {
  // Channels
  getChannels: channelService.getChannels,
  createChannel: channelService.createChannel,
  
  // Messages
  getChannelMessages: messageService.getChannelMessages,
  sendChannelMessage: messageService.sendChannelMessage,
  markAsRead: messageService.markAsRead,
  
  // Direct Messages
  getDirectMessages: directMessageService.getDirectMessages,
  sendDirectMessage: directMessageService.sendDirectMessage,
  markDirectMessageAsRead: directMessageService.markDirectMessageAsRead
};
