
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatMessage } from './chat.types';
import { v4 as uuidv4 } from 'uuid';

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
      return (data || []).map((msg: DbMessage) => ({
        id: msg.id,
        channel_id: channelId,
        user_id: msg.sender_id,
        content: msg.content,
        is_read: msg.is_read || false,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        reactions: msg.reactions || {},
        attachments: msg.attachments || []
      }));
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
      let attachmentUrls: Array<{
        id: string;
        type: string;
        url: string;
        name: string;
      }> = [];

      // Upload attachments if any
      if (message.attachments && message.attachments.length > 0) {
        // Process each file and upload
        for (const attachment of message.attachments) {
          // Generate a unique file path
          const fileExt = attachment.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `chat/${message.channel_id}/${fileName}`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('chat-attachments')
            .upload(filePath, attachment.file);
            
          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            continue;
          }
          
          // Get public URL for the uploaded file
          const { data: { publicUrl } } = supabase
            .storage
            .from('chat-attachments')
            .getPublicUrl(filePath);
            
          attachmentUrls.push({
            id: attachment.id,
            type: attachment.type,
            url: publicUrl,
            name: attachment.name
          });
        }
      }
      
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
        return {
          id: data.id,
          channel_id: message.channel_id,
          user_id: message.user_id,
          content: data.content,
          is_read: data.is_read || false,
          created_at: data.created_at,
          updated_at: data.updated_at,
          reactions: data.reactions as Record<string, string[]> || {},
          attachments: data.attachments || []
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
  },
  
  async addReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    try {
      // First get the current message to access its reactions
      const { data: message, error: fetchError } = await supabase
        .from('chat_messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Get current reactions or initialize empty object
      const currentReactions = (message?.reactions as Record<string, string[]>) || {};
      
      // Get users who reacted with this emoji or initialize empty array
      const usersForEmoji = currentReactions[emoji] || [];
      
      // Check if user already reacted with this emoji
      const userIndex = usersForEmoji.indexOf(userId);
      
      let updatedUsers;
      if (userIndex >= 0) {
        // Remove user from the emoji's users (toggle off)
        updatedUsers = [
          ...usersForEmoji.slice(0, userIndex),
          ...usersForEmoji.slice(userIndex + 1)
        ];
      } else {
        // Add user to the emoji's users (toggle on)
        updatedUsers = [...usersForEmoji, userId];
      }
      
      // Create updated reactions object
      const updatedReactions = {
        ...currentReactions,
        [emoji]: updatedUsers
      };
      
      // Remove empty reaction arrays
      Object.keys(updatedReactions).forEach(key => {
        if (updatedReactions[key].length === 0) {
          delete updatedReactions[key];
        }
      });
      
      // Update the message with new reactions
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
