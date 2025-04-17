
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatMessage } from './chat.types';
import { v4 as uuidv4 } from 'uuid';
import { uploadAttachments } from './message/attachment.service';
import { transformToMessage } from './message/transform.service';

// Define a simplified database message interface to avoid deep type instantiation
interface DbMessage {
  id: string;
  content: string;
  channel_id: string | null;
  sender_id: string;
  is_read: boolean | null;
  reactions: Record<string, string[]> | null;
  created_at: string;
  updated_at: string;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    name: string;
  }>;
}

export const messageService = {
  async getChannelMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at');

      if (error) throw error;
      
      // Transform the raw data to our ChatMessage type with explicit casting
      return (data || []).map((msg: DbMessage) => transformToMessage(msg, channelId));
    } catch (error: any) {
      console.error(`Error fetching messages for channel ${channelId}:`, error);
      return [];
    }
  },

  async sendChannelMessage(message: { 
    channel_id: string; 
    user_id?: string; 
    content: string; 
    is_read?: boolean;
    attachments?: Array<{
      id: string;
      file: File;
      type: string;
      name: string;
    }>;
  }): Promise<ChatMessage | null> {
    try {
      // Upload attachments if any
      const attachmentUrls = await uploadAttachments(
        message.attachments || [], 
        `chat/${message.channel_id}/`
      );
      
      // Create a properly structured message for the database
      const dbMessage = {
        content: message.content,
        sender_id: message.user_id || '',
        channel_id: message.channel_id,
        is_read: message.is_read || false,
        reactions: {},
        attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined
      };
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(dbMessage)
        .select()
        .single();

      if (error) throw error;
      
      // Transform response to match ChatMessage interface
      if (data) {
        return transformToMessage(data, message.channel_id);
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
  },
  
  async addReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    try {
      const { data: message, error: fetchError } = await supabase
        .from('chat_messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentReactions = (message?.reactions as Record<string, string[]>) || {};
      const usersForEmoji = currentReactions[emoji] || [];
      const userIndex = usersForEmoji.indexOf(userId);
      
      let updatedUsers;
      if (userIndex >= 0) {
        updatedUsers = [
          ...usersForEmoji.slice(0, userIndex),
          ...usersForEmoji.slice(userIndex + 1)
        ];
      } else {
        updatedUsers = [...usersForEmoji, userId];
      }
      
      const updatedReactions = {
        ...currentReactions,
        [emoji]: updatedUsers
      };
      
      Object.keys(updatedReactions).forEach(key => {
        if (updatedReactions[key].length === 0) {
          delete updatedReactions[key];
        }
      });
      
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);
      
      if (updateError) throw updateError;
      return true;
    } catch (error: any) {
      console.error(`Error updating reaction for message ${messageId}:`, error);
      return false;
    }
  }
};
