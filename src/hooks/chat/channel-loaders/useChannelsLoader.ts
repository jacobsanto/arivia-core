
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { chatService } from "@/services/chat/chat.service";
import { Channel } from "@/components/chat/sidebar/ChatSidebar";
import { toast } from "sonner";
import { FALLBACK_GENERAL_CHANNEL } from "@/services/chat/chat.types";
import { logger } from "@/services/logger";

export function useChannelsLoader(isConnected: boolean) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    async function loadChannels() {
      if (!user || !isConnected) return;
      
      try {
        // Load channels
        let channelsData = await chatService.getChannels();
        let generalChannel;
        
        try {
          // Attempt to get or create the general channel
          generalChannel = await chatService.getOrCreateGeneralChannel();
        } catch (error) {
          logger.error("Error getting general channel", { error });
          // Fall back to local general channel definition
          generalChannel = FALLBACK_GENERAL_CHANNEL;
        }
        
        if (generalChannel) {
          // Check if general channel exists in fetched channels
          const generalExists = channelsData.some(ch => ch.id === generalChannel!.id);
          
          // Only add general channel if it doesn't already exist
          const allChannels = generalExists ? channelsData : [generalChannel, ...channelsData];
          
          // Convert to Channel format for sidebar
          const typedChannels: Channel[] = allChannels.map(channel => ({
            id: channel.id,
            name: channel.name,
            description: '',
            memberCount: 0,
            unreadCount: 0,
            isPrivate: false
          }));
          
          setChannels(typedChannels);
          setLoadError(null);
        }
      } catch (error) {
        logger.error("Failed to load channels", { error });
        toast.error("Failed to load channels", {
          description: "Using offline mode for channels"
        });
        
        const fallbackChannel: Channel = {
          id: FALLBACK_GENERAL_CHANNEL.id,
          name: FALLBACK_GENERAL_CHANNEL.name,
          description: '',
          memberCount: 0,
          unreadCount: 0,
          isPrivate: false
        };
        
        setChannels([fallbackChannel]);
        setLoadError("Failed to load channels");
      }
    }
    
    loadChannels();
  }, [user, isConnected]);

  return { channels, loadError };
}
