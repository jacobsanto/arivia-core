// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatChannel, GENERAL_CHAT_CHANNEL_ID } from './chat.types';
import { logger } from '@/services/logger';

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
      logger.error('Error fetching chat channels', error);
      // Don't toast here, we'll handle it at the component level
      return [];
    }
  },

  async getOrCreateGeneralChannel(): Promise<ChatChannel | null> {
    try {
      // First, check if a general channel exists
      const { data, error } = await supabase
        .from('chat_channels')
        .select('*')
        .eq('id', GENERAL_CHAT_CHANNEL_ID)
        .single();

      if (!error && data) {
        return data;
      }

      // If not found, create the general channel with the proper UUID
      const channel = {
        id: GENERAL_CHAT_CHANNEL_ID,
        name: 'General',
        description: 'Public chat for all users',
        is_property_specific: false
      };

      // Use upsert instead of insert to avoid duplicate key errors
      const { data: newChannel, error: createError } = await supabase
        .from('chat_channels')
        .upsert(channel)
        .select()
        .single();

      if (createError) throw createError;
      
      return newChannel;
    } catch (error: any) {
      logger.error('Error with general channel', error);
      // Don't toast here, we'll handle it at the component level
      return null;
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
      logger.error('Error creating channel', error);
      toast.error('Failed to create channel', {
        description: error.message
      });
      return null;
    }
  }
};
