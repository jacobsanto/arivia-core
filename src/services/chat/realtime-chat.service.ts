import { supabase } from '@/integrations/supabase/client';
import {
  ChatUser,
  ChatMessage,
  MessageReaction,
  MessageAttachment,
  ChatChannel,
  DirectConversation,
  TypingIndicator
} from '@/types/chat.types';

// Chat Channels API
export const chatChannelsAPI = {
  // Get all channels user has access to
  async getChannels(): Promise<ChatChannel[]> {
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(channel => ({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      topic: channel.topic,
      type: channel.type as 'public' | 'private',
      createdBy: channel.created_by,
      createdAt: channel.created_at,
      updatedAt: channel.updated_at,
      members: [],
      unreadCount: 0,
      pinnedMessages: []
    })) as ChatChannel[];
  },

  // Create a new channel
  async createChannel(name: string, description?: string, topic?: string, type: 'public' | 'private' = 'public'): Promise<ChatChannel> {
    const { data, error } = await supabase
      .from('chat_channels')
      .insert({
        name,
        description,
        topic,
        type,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-join the creator to the channel
    await supabase
      .from('channel_members')
      .insert({
        channel_id: data.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        role: 'admin'
      });

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      topic: data.topic,
      type: data.type as 'public' | 'private',
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      members: [],
      unreadCount: 0,
      pinnedMessages: []
    } as ChatChannel;
  },

  // Join a channel
  async joinChannel(channelId: string): Promise<void> {
    const { error } = await supabase
      .from('channel_members')
      .insert({
        channel_id: channelId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) throw error;
  },

  // Leave a channel
  async leaveChannel(channelId: string): Promise<void> {
    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  }
};

// Direct Conversations API
export const directConversationsAPI = {
  // Get all direct conversations for current user
  async getConversations(): Promise<DirectConversation[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('direct_conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(conv => ({
      id: conv.id,
      participants: [],
      unreadCount: 0,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at
    })) as DirectConversation[];
  },

  // Create or get direct conversation
  async getOrCreateConversation(otherUserId: string): Promise<string> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
      user1_id: userId,
      user2_id: otherUserId
    });

    if (error) throw error;
    return data;
  }
};

// Chat Messages API
export const chatMessagesAPI = {
  // Get messages for a channel
  async getChannelMessages(channelId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Get authors separately to avoid relation issues
    const messages = data || [];
    const authorIds = [...new Set(messages.map(msg => msg.author_id))];
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, email, avatar, role')
      .in('user_id', authorIds);
    
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    
    return messages.map(msg => {
      const profile = profileMap.get(msg.author_id);
      return {
        id: msg.id,
        content: msg.content,
        authorId: msg.author_id,
        author: profile ? {
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          role: profile.role,
          isOnline: false
        } : {
          id: msg.author_id,
          name: 'Unknown User',
          email: '',
          role: 'user',
          isOnline: false
        },
        channelId: msg.channel_id,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
        reactions: [],
        mentions: msg.mentions || [],
        attachments: []
      };
    }) as ChatMessage[];
  },

  // Get messages for a direct conversation
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Get authors separately to avoid relation issues
    const messages = data || [];
    const authorIds = [...new Set(messages.map(msg => msg.author_id))];
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, email, avatar, role')
      .in('user_id', authorIds);
    
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    
    return messages.map(msg => {
      const profile = profileMap.get(msg.author_id);
      return {
        id: msg.id,
        content: msg.content,
        authorId: msg.author_id,
        author: profile ? {
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          role: profile.role,
          isOnline: false
        } : {
          id: msg.author_id,
          name: 'Unknown User',
          email: '',
          role: 'user',
          isOnline: false
        },
        conversationId: msg.conversation_id,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
        reactions: [],
        mentions: msg.mentions || [],
        attachments: []
      };
    }) as ChatMessage[];
  },

  // Send a message to a channel
  async sendChannelMessage(channelId: string, content: string, replyToId?: string, attachments?: any[]): Promise<ChatMessage> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        author_id: userId,
        channel_id: channelId,
        reply_to_id: replyToId,
        attachments: attachments || []
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Get the author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, name, email, avatar, role')
      .eq('user_id', userId)
      .single();
    
    return {
      id: data.id,
      content: data.content,
      authorId: data.author_id,
      author: profile ? {
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        role: profile.role,
        isOnline: false
      } : {
        id: userId,
        name: 'Current User',
        email: '',
        role: 'user',
        isOnline: false
      },
      channelId: data.channel_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      reactions: [],
      mentions: data.mentions || [],
      attachments: []
    } as ChatMessage;
  },

  // Send a message to a direct conversation
  async sendDirectMessage(conversationId: string, content: string, replyToId?: string, attachments?: any[]): Promise<ChatMessage> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        author_id: userId,
        conversation_id: conversationId,
        reply_to_id: replyToId,
        attachments: attachments || []
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // Get the author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, name, email, avatar, role')
      .eq('user_id', userId)
      .single();
    
    return {
      id: data.id,
      content: data.content,
      authorId: data.author_id,
      author: profile ? {
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        role: profile.role,
        isOnline: false
      } : {
        id: userId,
        name: 'Current User',
        email: '',
        role: 'user',
        isOnline: false
      },
      conversationId: data.conversation_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      reactions: [],
      mentions: data.mentions || [],
      attachments: []
    } as ChatMessage;
  },

  // Add reaction to message
  async addReaction(messageId: string, emoji: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji
      });

    if (error) throw error;
  },

  // Remove reaction from message
  async removeReaction(messageId: string, emoji: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (error) throw error;
  }
};

// Users API
export const chatUsersAPI = {
  // Get all team members
  async getTeamMembers(): Promise<ChatUser[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, name, email, avatar, role')
      .order('name');

    if (error) throw error;
    return (data || []).map(profile => ({
      id: profile.user_id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      role: profile.role,
      isOnline: false, // Presence functionality needed
      lastSeen: undefined
    }));
  }
};

// Typing Indicators API
export const typingIndicatorsAPI = {
  // Start typing indicator
  async startTyping(channelId?: string, conversationId?: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Clean up expired indicators first
    await supabase.rpc('cleanup_expired_typing_indicators');

    // Remove existing typing indicator for this user
    await supabase
      .from('typing_indicators')
      .delete()
      .eq('user_id', userId);

    // Add new typing indicator
    const { error } = await supabase
      .from('typing_indicators')
      .insert({
        user_id: userId,
        channel_id: channelId,
        conversation_id: conversationId
      });

    if (error) throw error;
  },

  // Stop typing indicator
  async stopTyping(): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('typing_indicators')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get typing indicators for channel/conversation
  async getTypingIndicators(channelId?: string, conversationId?: string): Promise<TypingIndicator[]> {
    const query = supabase
      .from('typing_indicators')
      .select('*')
      .gt('expires_at', new Date().toISOString());

    if (channelId) {
      query.eq('channel_id', channelId);
    } else if (conversationId) {
      query.eq('conversation_id', conversationId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(indicator => ({
      userId: indicator.user_id,
      user: {
        id: indicator.user_id,
        name: 'User',
        email: '',
        role: 'user',
        isOnline: true
      },
      channelId: indicator.channel_id,
      conversationId: indicator.conversation_id,
      timestamp: indicator.started_at
    })) as TypingIndicator[];
  }
};