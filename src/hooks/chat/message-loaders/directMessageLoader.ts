
import { supabase } from "@/integrations/supabase/client";
import { chatService } from "@/services/chat/chat.service";
import { Message } from "../../useChatTypes";

export async function loadDirectMessages(
  user: { id: string; name?: string; avatar?: string },
  recipientId: string,
  setIsOffline: (value: boolean) => void
): Promise<Message[]> {
  try {
    const directMessages = await chatService.getDirectMessages(user.id, recipientId);
    
    // Handle empty direct messages
    if (directMessages.length === 0) {
      console.log("No direct messages found between users");
      setIsOffline(false);
      return [];
    }
    
    // Mark messages as read
    directMessages.forEach(msg => {
      if (msg.sender_id === recipientId && !msg.is_read) {
        chatService.markDirectMessageAsRead(msg.id);
      }
    });
    
    // Get sender and recipient profiles
    let userProfiles: Record<string, { name: string, avatar: string }> = {};
    
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .in('id', [user.id, recipientId]);
      
      if (profiles && profiles.length > 0) {
        userProfiles = profiles.reduce((acc, profile) => {
          acc[profile.id] = {
            name: profile.name || 'Unknown User',
            avatar: profile.avatar || '/placeholder.svg'
          };
          return acc;
        }, {} as Record<string, { name: string, avatar: string }>);
      } else {
        console.log("No user profiles found for direct message participants");
      }
    } catch (error) {
      console.warn('Failed to load user profiles, using default values', error);
    }
    
    const uiMessages = directMessages.map(msg => {
      const isSender = msg.sender_id === user.id;
      const profileId = isSender ? user.id : recipientId;
      const profile = userProfiles[profileId];
      
      return {
        id: msg.id,
        sender: profile?.name || (isSender ? user.name : "Other User"),
        avatar: profile?.avatar || "/placeholder.svg",
        content: msg.content,
        timestamp: msg.created_at || new Date().toISOString(),
        isCurrentUser: isSender,
        reactions: {},
        attachments: msg.attachments
      };
    });
    
    setIsOffline(false);
    return uiMessages;
    
  } catch (error) {
    console.error("Error loading direct messages:", error);
    setIsOffline(true);
    return [{
      id: 'offline-1',
      sender: 'System',
      avatar: '/placeholder.svg',
      content: 'Direct messaging is unavailable in offline mode.',
      timestamp: new Date().toISOString(),
      isCurrentUser: false,
      reactions: {}
    }];
  }
}
