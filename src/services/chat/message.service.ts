
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatMessage, ChatMessageDB } from './chat.types';

export const messageService = {
  async getChannelMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at');

      if (error) throw error;
      
      // Break recursive type inference with explicit typing
      // Use the proper ChatMessageDB type that's defined in chat.types.ts
      return ((data || []) as unknown as ChatMessageDB[]).map(msg => ({
        id: msg.id,
        channel_id: channelId,
        user_id: msg.sender_id,
        content: msg.content,
        is_read: msg.is_read,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        reactions: msg.reactions || {}
      }));
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
  }
};
