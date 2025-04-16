
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DirectMessage } from './chat.types';

export const directMessageService = {
  async getDirectMessages(currentUserId: string, otherUserId: string): Promise<DirectMessage[]> {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .or(`sender_id.eq.${otherUserId},recipient_id.eq.${otherUserId}`)
        .order('created_at');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching direct messages between ${currentUserId} and ${otherUserId}:`, error);
      return [];
    }
  },

  async getUnreadMessageCounts(userId: string): Promise<Record<string, number>> {
    try {
      // Get all unread messages for this user
      const { data, error } = await supabase
        .from('direct_messages')
        .select('sender_id, id')
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      // Count messages by sender
      const unreadCounts: Record<string, number> = {};
      if (data) {
        data.forEach((msg) => {
          const senderId = msg.sender_id;
          unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;
        });
      }

      return unreadCounts;
    } catch (error: any) {
      console.error('Error fetching unread message counts:', error);
      return {};
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
