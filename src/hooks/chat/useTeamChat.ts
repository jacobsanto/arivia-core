
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator";
import { useUserPresence } from "@/hooks/chat/useUserPresence";
import { supabase } from "@/integrations/supabase/client";
import { Channel, DirectMessage } from "@/components/chat/ChatSidebar";
import { useChat } from "@/hooks/useChat";
import { FALLBACK_GENERAL_CHANNEL } from "@/services/chat/chat.types"; 

export function useTeamChat() {
  // State
  const [activeChat, setActiveChat] = useState("General");
  const [activeChatId, setActiveChatId] = useState("");
  const [activeTab, setActiveTab] = useState("direct");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [chatType, setChatType] = useState<'general' | 'direct'>('general');
  const [isConnected, setIsConnected] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // For reactions
  const [reactionMessageId, setReactionMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Hooks
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { userStatuses, getUserStatus } = useUserPresence();
  const { typingStatus, handleTyping, clearTyping } = useTypingIndicator(activeChatId);
  
  // Use our chat hook to manage messages
  const {
    messages,
    loading,
    isOffline,
    messageInput,
    setMessageInput,
    sendMessage,
    addReaction
  } = useChat(chatType, activeChatId);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSelectChat = (chatId: string, chatName: string, type: 'general' | 'direct') => {
    setActiveChat(chatName);
    setActiveChatId(chatId);
    setChatType(type);
    
    // Close sidebar on mobile after selecting chat
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Handle sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    handleTyping();
  };

  // Load channels and users for DMs
  useEffect(() => {
    async function loadChannelsAndUsers() {
      if (!user) return;
      
      try {
        // Check connection to Supabase
        try {
          // Use a simple ping to check connection instead of _heartbeats table
          const { data, error } = await supabase.from('chat_channels').select('count').limit(1);
          if (error) throw error;
          setIsConnected(true);
          setLoadError(null);
        } catch (connectionError) {
          setIsConnected(false);
          setLoadError("Connection to server failed. Using offline mode.");
          console.warn("Connection error:", connectionError);
          
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
          
          // Ensure user sees an appropriate message - don't continue loading
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
            // Check if general channel already exists in the fetched channels
            const generalExists = channelsData.some(ch => ch.id === generalChannel!.id);
            
            // Only add general channel if it doesn't already exist in the list
            const allChannels = generalExists ? channelsData : [generalChannel, ...channelsData];
            
            // Convert to Channel format for sidebar
            const typedChannels: Channel[] = allChannels.map(channel => ({
              id: channel.id,
              name: channel.name,
              status: "offline" as const, // Channels don't have online status
              unreadCount: 0 // For now, we're not tracking unread counts for channels
            }));
            
            setChannels(typedChannels);
            
            // Set General as the active chat by default
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
          // Load real user data from profiles
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, avatar')
            .neq('id', user.id); // Don't include current user
          
          if (profilesError) {
            throw profilesError;
          }
          
          if (profiles) {
            // Get unread counts for direct messages
            let unreadCounts: Record<string, number> = {};
            try {
              unreadCounts = await chatService.getUnreadMessageCounts(user.id);
            } catch (error) {
              console.warn("Failed to get unread counts:", error);
            }
            
            const userProfiles: DirectMessage[] = profiles.map(profile => ({
              id: profile.id,
              name: profile.name || 'Unknown User',
              avatar: profile.avatar || '/placeholder.svg',
              status: getUserStatus(profile.id),
              unreadCount: unreadCounts[profile.id] || 0
            }));
            
            setDirectMessages(userProfiles);
          }
        } catch (error) {
          console.error("Failed to load user profiles:", error);
          toast.error("Failed to load user profiles", {
            description: "Direct messaging may be limited"
          });
          
          // Use empty direct messages list
          setDirectMessages([]);
        }
      } catch (error) {
        setLoadError("Failed to load chat data. Using offline mode.");
        console.error("General load error:", error);
      }
    }
    
    loadChannelsAndUsers();
    
    // Set up an interval to refresh user status and unread counts every minute
    const intervalId = setInterval(() => {
      if (isConnected) {
        loadChannelsAndUsers();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [user, getUserStatus, isConnected, activeChatId]);

  // Extract just the emoji symbols
  const emojiSymbols = ["👍", "❤️", "😊", "🎉", "😂", "🤔"];

  return {
    // State
    activeChat,
    activeTab,
    sidebarOpen,
    channels,
    directMessages,
    isConnected,
    loadError,
    messageInput,
    messages,
    loading,
    isOffline,
    typingStatus,
    reactionMessageId,
    showEmojiPicker,
    emojiSymbols,

    // Actions
    setActiveTab,
    toggleSidebar,
    handleSelectChat,
    handleSendMessage,
    handleChangeMessage,
    addReaction,
    setReactionMessageId,
    setShowEmojiPicker
  };
}
