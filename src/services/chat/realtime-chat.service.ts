// Stub file - chat service is not fully implemented yet
// Tables like direct_conversations, typing_indicators, etc. need to be created first

import { ChatChannel, ChatMessage, ChatUser, DirectConversation } from '@/types/chat.types';

export const chatChannelsAPI = {
  async getChannels(): Promise<ChatChannel[]> {
    return [];
  },
  async createChannel(name: string, description?: string, topic?: string, type: 'public' | 'private' = 'public'): Promise<ChatChannel> {
    throw new Error('Not implemented');
  },
  async joinChannel(): Promise<void> {
    console.warn('joinChannel not implemented');
  },
};

export const chatMessagesAPI = {
  async getMessages(): Promise<ChatMessage[]> {
    return [];
  },
  async sendMessage(): Promise<ChatMessage> {
    throw new Error('Not implemented');
  },
  async getChannelMessages(): Promise<ChatMessage[]> {
    return [];
  },
  async getConversationMessages(): Promise<ChatMessage[]> {
    return [];
  },
  async sendChannelMessage(): Promise<ChatMessage> {
    throw new Error('Not implemented');
  },
  async sendDirectMessage(): Promise<ChatMessage> {
    throw new Error('Not implemented');
  },
  async addReaction(): Promise<void> {
    console.warn('addReaction not implemented');
  },
  async removeReaction(): Promise<void> {
    console.warn('removeReaction not implemented');
  },
};

export const chatUsersAPI = {
  async getUsers(): Promise<ChatUser[]> {
    return [];
  },
};

export const directConversationsAPI = {
  async getConversations(): Promise<DirectConversation[]> {
    return [];
  },
  async getOrCreateConversation(): Promise<DirectConversation> {
    throw new Error('Not implemented');
  },
};

export const typingIndicatorsAPI = {
  startTyping: (channelId?: string, conversationId?: string) => {},
  stopTyping: () => {},
};
