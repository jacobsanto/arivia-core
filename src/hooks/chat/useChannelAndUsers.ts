
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { chatService } from "@/services/chat/chat.service";
import { Channel, DirectMessage } from "@/components/chat/ChatSidebar";
import { toast } from "sonner";
import { useUserPresence } from "@/hooks/chat/useUserPresence";
import { FALLBACK_GENERAL_CHANNEL } from "@/services/chat/chat.types";

export function useChannelAndUsers() {
  // State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState("");
  const [activeChat, setActiveChat] = useState("General");
  const [chatType, setChatType] = useState<'general' | 'direct'>('general');

  // Hooks
  const { user } = useUser();
  const { getUserStatus } = useUserPresence();

  // Load channels and users
  useEffect(() => {
    async function loadChannelsAndUsers() {
      if (!user) return;
      
      try {
        // Check connection to Supabase
        try {
          // Use a simple ping to check connection
          const { data, error } = await supabase.from('chat_channels').select('count').limit(1);
          if (error) throw error;
          setIsConnected(true);
          setLoadError(null);
        } catch (connectionError) {
          console.warn("Connection error:", connectionError);
          setIsConnected(false);
          setLoadError("Connection to server failed. Using offline mode.");
          
          // Set offline mode with fallback data
          const fallbackChannel = {
            id: FALLBACK_GENERAL_CHANNEL.id,
            name: FALLBACK_GENERAL_CHANNEL.name,
            status: "offline" as const,
            unreadCount: 0
          };
          
          setChannels([fallbackChannel]);
          
          // Default to General channel in offline mode
          setActiveChatId(FALLBACK_GENERAL_CHANNEL.id);
          setActiveChat(FALLBACK_GENERAL_CHANNEL.name);
          setChatType('general');
          
          // Early return to skip further requests when offline
          return;
        }
        
        // Load channels
        try {
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
            
            // Set General as the active chat by default if no active chat is selected
            if (activeChatId === "" && generalChannel) {
              setActiveChatId(generalChannel.id);
              setActiveChat(generalChannel.name);
              setChatType('general');
            }
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
          
          // Default to General channel
          setActiveChatId(FALLBACK_GENERAL_CHANNEL.id);
          setActiveChat(FALLBACK_GENERAL_CHANNEL.name);
          setChatType('general');
        }
        
        // Load user profiles for direct messages
        try {
          // Improved user profile loading with better error handling
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, avatar')
            .neq('id', user.id) // Don't include current user
            .limit(100); // Add limit for better performance
          
          if (profilesError) {
            throw profilesError;
          }
          
          // Gracefully handle no users scenario
          if (!profiles || profiles.length === 0) {
            console.log("No other users found in the system");
            setDirectMessages([]);
            return;
          }
          
          // Get unread counts for direct messages
          let unreadCounts: Record<string, number> = {};
          try {
            unreadCounts = await chatService.getUnreadMessageCounts(user.id);
          } catch (error) {
            console.warn("Failed to get unread counts:", error);
            // Continue without unread counts
          }
          
          const userProfiles: DirectMessage[] = profiles.map(profile => ({
            id: profile.id,
            name: profile.name || 'Unknown User',
            avatar: profile.avatar || '/placeholder.svg',
            status: getUserStatus(profile.id),
            unreadCount: unreadCounts[profile.id] || 0
          }));
          
          setDirectMessages(userProfiles);
        } catch (error) {
          console.error("Failed to load user profiles:", error);
          
          // Improved error handling - show toast but don't crash
          toast.error("Failed to load user profiles", {
            description: "Direct messaging functionality may be limited"
          });
          
          // Set empty direct messages list instead of failing
          setDirectMessages([]);
        }
      } catch (error) {
        setLoadError("Failed to load chat data. Using offline mode.");
        console.error("General load error:", error);
      }
    }
    
    loadChannelsAndUsers();
    
    // Set up an interval to refresh user status and unread counts every minute
    // but only if connected
    const intervalId = setInterval(() => {
      if (isConnected && user) {
        loadChannelsAndUsers();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [user, getUserStatus, isConnected]);

  const handleSelectChat = (chatId: string, chatName: string, type: 'general' | 'direct') => {
    setActiveChat(chatName);
    setActiveChatId(chatId);
    setChatType(type);
  };

  return {
    channels, 
    directMessages,
    isConnected,
    loadError,
    activeChat,
    activeChatId,
    chatType,
    handleSelectChat
  };
}
