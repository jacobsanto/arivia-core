import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatMessage } from './chat.types';
import { v4 as uuidv4 } from 'uuid';
import { uploadAttachments } from './message/attachment.service';
import { transformToMessage, DbMessage } from './message/transform.service';
import { logger } from '@/services/logger';

export const messageService = {
  async getChannelMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at');

      if (error) throw error;
      
      // Transform the raw data to our ChatMessage type with explicit casting
      return (data || []).map((msg: any) => transformToMessage(msg as DbMessage, channelId));
    } catch (error: any) {
      logger.error('Error fetching messages for channel', error, { component: 'chat', channelId });
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
      
      // Create a properly structured message for the database (using type assertion for fields not in generated types)
      const dbMessage = {
        content: message.content,
        author_id: message.user_id || '',
        channel_id: message.channel_id,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined
      };
      
      const { data, error } = await (supabase as any)
        .from('chat_messages')
        .insert(dbMessage)
        .select()
        .single();

      if (error) throw error;
      
      // Transform response to match ChatMessage interface
      if (data) {
        const transformedData: DbMessage = {
          ...data,
          sender_id: data.author_id,
          is_read: false,
          reactions: {}
        };
        return transformToMessage(transformedData, message.channel_id);
      }
      
      return null;
    } catch (error: any) {
      logger.error('Error sending message', error);
      toast.error('Failed to send message', {
        description: error.message
      });
      return null;
    }
  },

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      // Note: is_read field may not exist in current schema, using type assertion
      const { error } = await (supabase as any)
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      logger.error('Error marking message as read', error, { component: 'chat', messageId });
      return false;
    }
  },
  
  async addReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    try {
      // Note: reactions field may not exist in current schema, using type assertion
      const { data: message, error: fetchError } = await (supabase as any)
        .from('chat_messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentReactions = ((message as any)?.reactions as Record<string, string[]>) || {};
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
      
      const { error: updateError } = await (supabase as any)
        .from('chat_messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);
      
      if (updateError) throw updateError;
      return true;
    } catch (error: any) {
      logger.error('Error updating reaction for message', error, { component: 'chat', messageId });
      return false;
    }
  }
};
