
import { supabase } from "@/integrations/supabase/client";
import { chatService } from "@/services/chat/chat.service";
import { Message } from "../../useChatTypes";
import { FALLBACK_MESSAGES } from "@/services/chat/chat.types";

export async function loadChannelMessages(
  user: { id: string; name?: string; avatar?: string },
  setIsOffline: (value: boolean) => void
): Promise<Message[]> {
  try {
    // First ensure a general channel exists
    const generalChannel = await chatService.getOrCreateGeneralChannel();
    
    if (!generalChannel) {
      throw new Error("Could not get general channel");
    }
    
    // Then load messages for that channel
    const channelMessages = await chatService.getChannelMessages(generalChannel.id);
    
    // Check if we have any messages - it's normal to have none initially
    if (channelMessages.length === 0) {
      console.log("No messages found in general channel, showing empty state");
      setIsOffline(false);
      return [];
    }
    
    // Get user profiles for all message senders
    const userIds = [...new Set(channelMessages.map(msg => msg.user_id))].filter(Boolean) as string[];
    
    let userProfiles: Record<string, { name: string, avatar: string }> = {};
    
    if (userIds.length > 0) {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .in('id', userIds);
          
        if (profiles && profiles.length > 0) {
          userProfiles = profiles.reduce((acc, profile) => {
            acc[profile.id] = { 
              name: profile.name || 'Unknown User', 
              avatar: profile.avatar || '/placeholder.svg' 
            };
            return acc;
          }, {} as Record<string, { name: string, avatar: string }>);
        } else {
          console.log("No user profiles found for message senders");
        }
      } catch (error) {
        console.warn('Failed to load user profiles, using default values', error);
      }
    }
    
    const uiMessages = channelMessages.map(msg => {
      const profile = msg.user_id ? userProfiles[msg.user_id] : null;
      
      return {
        id: msg.id,
        sender: profile?.name || "Unknown User",
        avatar: profile?.avatar || "/placeholder.svg",
        content: msg.content,
        timestamp: msg.created_at || new Date().toISOString(),
        isCurrentUser: msg.user_id === user.id,
        reactions: msg.reactions || {}
      };
    });
    
    setIsOffline(false);
    return uiMessages;
  } catch (error) {
    console.error("Error loading general channel messages:", error);
    setIsOffline(true);
    
    // Return fallback messages for offline mode
    return FALLBACK_MESSAGES.map(msg => ({
      id: msg.id,
      sender: "System",
      avatar: "/placeholder.svg",
      content: msg.content,
      timestamp: msg.created_at || new Date().toISOString(),
      isCurrentUser: false,
      reactions: {}
    }));
  }
}
