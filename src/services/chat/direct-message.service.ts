// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { DirectMessage } from './chat.types';
import { uploadAttachments } from './message/attachment.service';
import { transformToDirectMessage, DbDirectMessage } from './direct-message/transform.service';

export const directMessageService = {
  async getDirectMessages(userId: string, otherUserId: string): Promise<DirectMessage[]> {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
        .order('created_at');
        
      if (error) throw error;
      
      return (data || []).map(msg => transformToDirectMessage(msg as DbDirectMessage));
    } catch (error: any) {
      console.error(`Error fetching direct messages between ${userId} and ${otherUserId}:`, error);
      return [];
    }
  },
  
  async sendDirectMessage(message: { 
    sender_id: string; 
    recipient_id: string; 
    content: string; 
    is_read: boolean;
    attachments?: Array<{
      id: string;
      file: File;
      type: string;
      name: string;
    }>;
  }): Promise<DirectMessage | null> {
    try {
      // Upload attachments if any
      const attachmentUrls = await uploadAttachments(
        message.attachments || [], 
        `direct/${message.sender_id}_${message.recipient_id}/`
      );
      
      // Create a properly structured message for the database
      const dbMessage = {
        sender_id: message.sender_id,
        recipient_id: message.recipient_id,
        content: message.content,
        is_read: message.is_read,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined
      };
      
      const { data, error } = await supabase
        .from('direct_messages')
        .insert(dbMessage)
        .select()
        .single();
        
      if (error) throw error;
      
      return data ? transformToDirectMessage(data as DbDirectMessage) : null;
    } catch (error: any) {
      console.error(`Error sending direct message:`, error);
      return null;
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
  },
  
  async getUnreadMessageCounts(userId: string): Promise<Record<string, number>> {
    try {
      // Get all unread messages where this user is the recipient
      const { data, error } = await supabase
        .from('direct_messages')
        .select('sender_id')
        .eq('recipient_id', userId)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Count unread messages by sender
      const counts: Record<string, number> = {};
      
      if (data) {
        data.forEach(message => {
          const senderId = message.sender_id;
          counts[senderId] = (counts[senderId] || 0) + 1;
        });
      }
      
      return counts;
    } catch (error: any) {
      console.error(`Error getting unread message counts for user ${userId}:`, error);
      return {};
    }
  }
};
