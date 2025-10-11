import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatChannel, GENERAL_CHAT_CHANNEL_ID } from './chat.types';
import { logger } from '@/services/logger';

export const channelService = {
  async getChannels(): Promise<ChatChannel[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('chat_channels')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []).map((item: any) => ({
        ...item,
        is_property_specific: item.is_property_specific ?? false
      }));
    } catch (error: any) {
      logger.error('Error fetching chat channels', error);
      // Don't toast here, we'll handle it at the component level
      return [];
    }
  },

  async getOrCreateGeneralChannel(): Promise<ChatChannel | null> {
    try {
      // First, check if a general channel exists (using type assertion for fields not in generated types)
      const { data, error } = await (supabase as any)
        .from('chat_channels')
        .select('*')
        .eq('id', GENERAL_CHAT_CHANNEL_ID)
        .single();

      if (!error && data) {
        return {
          ...data,
          is_property_specific: data.is_property_specific ?? false
        };
      }

      // If not found, create the general channel with the proper UUID
      const channel = {
        id: GENERAL_CHAT_CHANNEL_ID,
        name: 'General',
        description: 'Public chat for all users',
        type: 'public',
        created_by: (await supabase.auth.getUser()).data.user?.id || 'system'
      };

      // Use upsert instead of insert to avoid duplicate key errors
      const { data: newChannel, error: createError } = await (supabase as any)
        .from('chat_channels')
        .upsert(channel)
        .select()
        .single();

      if (createError) throw createError;
      
      return {
        ...newChannel,
        is_property_specific: false
      };
    } catch (error: any) {
      logger.error('Error with general channel', error);
      // Don't toast here, we'll handle it at the component level
      return null;
    }
  },

  async createChannel(channel: Omit<ChatChannel, 'id' | 'created_at' | 'updated_at'>): Promise<ChatChannel | null> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      const dbChannel = {
        name: channel.name,
        description: channel.description,
        type: (channel as any).type || 'public',
        created_by: currentUser?.id || 'system'
      };
      
      const { data, error } = await (supabase as any)
        .from('chat_channels')
        .insert(dbChannel)
        .select()
        .single();

      if (error) throw error;
      toast.success('Channel created successfully');
      return {
        ...data,
        is_property_specific: channel.is_property_specific ?? false
      };
    } catch (error: any) {
      logger.error('Error creating channel', error);
      toast.error('Failed to create channel', {
        description: error.message
      });
      return null;
    }
  }
};
