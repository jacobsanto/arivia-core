
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatChannel } from './chat.types';

export const channelService = {
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
  }
};
