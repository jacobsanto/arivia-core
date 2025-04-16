
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DirectMessage } from './chat.types';

export const directMessageService = {
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
