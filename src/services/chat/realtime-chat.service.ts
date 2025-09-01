import { supabase } from '@/integrations/supabase/client';

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  topic?: string;
  type: 'public' | 'private';
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  members?: ChatUser[];
  unread_count?: number;
}

export interface DirectConversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  participants?: ChatUser[];
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  author_id: string;
  author?: ChatUser;
  channel_id?: string;
  conversation_id?: string;
  reply_to_id?: string;
  reply_to?: ChatMessage;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  mentions: string[];
  attachments: any[];
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  user?: ChatUser;
  emoji: string;
  created_at: string;
}

export interface TypingIndicator {
  id: string;
  user_id: string;
  user?: ChatUser;
  channel_id?: string;
  conversation_id?: string;
  started_at: string;
  expires_at: string;
}

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
      ...channel,
      members: [],
      unread_count: 0
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

    return data as ChatChannel;
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
    return (data || []) as DirectConversation[];
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
        ...msg,
        author: profile ? {
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          role: profile.role,
          isOnline: false
        } : undefined,
        reactions: []
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
        ...msg,
        author: profile ? {
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          role: profile.role,
          isOnline: false
        } : undefined,
        reactions: []
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
      ...data,
      author: profile ? {
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        role: profile.role,
        isOnline: false
      } : undefined,
      reactions: []
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
      ...data,
      author: profile ? {
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        role: profile.role,
        isOnline: false
      } : undefined,
      reactions: []
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
      isOnline: false, // TODO: Implement presence
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
    return (data || []) as TypingIndicator[];
  }
};