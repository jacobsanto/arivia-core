
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { chatService } from "@/services/chat/chat.service";
import { Channel } from "@/components/chat/ChatSidebar";
import { toast } from "sonner";
import { FALLBACK_GENERAL_CHANNEL } from "@/services/chat/chat.types";

export function useChannelsLoader(isConnected: boolean) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();

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
          console.error("Error getting general channel:", error);
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
            status: "offline" as const, // Channels don't have online status
            unreadCount: 0 // Not tracking unread counts for channels for now
          }));
          
          setChannels(typedChannels);
          setLoadError(null);
        }
      } catch (error) {
        console.error("Failed to load channels:", error);
        toast.error("Failed to load channels", {
          description: "Using offline mode for channels"
        });
        
        // Set fallback channels
        const fallbackChannel = {
          id: FALLBACK_GENERAL_CHANNEL.id,
          name: FALLBACK_GENERAL_CHANNEL.name,
          status: "offline" as const,
          unreadCount: 0
        };
        
        setChannels([fallbackChannel]);
        setLoadError("Failed to load channels");
      }
    }
    
    loadChannels();
  }, [user, isConnected]);

  return { channels, loadError };
}
