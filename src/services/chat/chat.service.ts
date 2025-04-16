
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  is_property_specific: boolean;
  property_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id?: string;
  content: string;
  reactions?: Record<string, any>;
  is_read?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at?: string;
}

// Define database structure interfaces to avoid type mismatches
interface ChatMessageDB {
  id: string;
  content: string;
  sender_id: string;
  channel_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const chatService = {
  // Channels
  async getChannels(): Promise<ChatChannel[]> {
    try {
      const { data, error } = await supabase
        .from('chat_channels')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching chat channels:', error);
      toast.error('Failed to load chat channels', {
        description: error.message
      });
      return [];
    }
  },

  async createChannel(channel: Omit<ChatChannel, 'id' | 'created_at' | 'updated_at'>): Promise<ChatChannel | null> {
    try {
      const { data, error } = await supabase
        .from('chat_channels')
        .insert(channel)
        .select()
        .single();

      if (error) throw error;
      toast.success('Channel created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating channel:', error);
      toast.error('Failed to create channel', {
        description: error.message
      });
      return null;
    }
  },

  // Messages
  async getChannelMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at');

      if (error) throw error;
      
      // Fix the recursive mapping issue by directly returning transformed data
      if (data) {
        return data.map((msg: ChatMessageDB) => ({
          id: msg.id,
          channel_id: channelId,
          user_id: msg.sender_id,
          content: msg.content,
          is_read: msg.is_read,
          created_at: msg.created_at,
          updated_at: msg.updated_at
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error(`Error fetching messages for channel ${channelId}:`, error);
      return [];
    }
  },

  async sendChannelMessage(message: { channel_id: string; user_id?: string; content: string; is_read?: boolean }): Promise<ChatMessage | null> {
    try {
      // Create a properly structured message for the database
      const dbMessage = {
        content: message.content,
        sender_id: message.user_id || '',
        channel_id: message.channel_id,
        is_read: message.is_read || false
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(dbMessage)
        .select()
        .single();

      if (error) throw error;
      
      // Transform response to match ChatMessage interface
      if (data) {
        return {
          id: data.id,
          channel_id: message.channel_id,
          user_id: message.user_id,
          content: data.content,
          is_read: data.is_read,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: error.message
      });
      return null;
    }
  },

  // Direct Messages
  async getDirectMessages(userId: string, otherId: string): Promise<DirectMessage[]> {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .or(`sender_id.eq.${otherId},recipient_id.eq.${otherId}`)
        .order('created_at');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching direct messages between ${userId} and ${otherId}:`, error);
      return [];
    }
  },

  async sendDirectMessage(message: Omit<DirectMessage, 'id' | 'created_at'>): Promise<DirectMessage | null> {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error sending direct message:', error);
      toast.error('Failed to send message', {
        description: error.message
      });
      return null;
    }
  },

  // Mark as read
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error(`Error marking message ${messageId} as read:`, error);
      return false;
    }
  },

  async markDirectMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error(`Error marking direct message ${messageId} as read:`, error);
      return false;
    }
  }
};
