import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import ChatSidebar, { Channel, DirectMessage } from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import { chatService } from "@/services/chat/chat.service";
import { toast } from "sonner";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator";

const TeamChat = () => {
  // State
  const [activeChat, setActiveChat] = useState("General");
  const [activeChatId, setActiveChatId] = useState("");
  const [activeTab, setActiveTab] = useState("direct");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [chatType, setChatType] = useState<'general' | 'direct'>('general');
  
  // Hooks
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { typingStatus, handleTyping, clearTyping } = useTypingIndicator();
  
  // Use our chat hook to manage messages
  const {
    messages,
    loading,
    messageInput,
    setMessageInput,
    sendMessage,
    addReaction
  } = useChat(chatType, activeChatId);
  
  // Load channels and users for DMs
  useEffect(() => {
    async function loadChannelsAndUsers() {
      if (!user) return;
      
      try {
        // Load channels
        const channelsData = await chatService.getChannels();
        
        // Make sure general channel exists
        const generalChannel = await chatService.getOrCreateGeneralChannel();
        
        if (generalChannel) {
          // Add to channels if not already there
          const channelExists = channelsData.some(ch => ch.id === generalChannel.id);
          
          const allChannels = channelExists ? channelsData : [generalChannel, ...channelsData];
          
          // Convert to Channel format for sidebar
          const typedChannels: Channel[] = allChannels.map(channel => ({
            id: channel.id,
            name: channel.name,
            status: "offline", // Channels don't have online status
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
        
        // TODO: Replace this with actual user data from profiles table
        // For now we'll use dummy data
        const dummyUsers: DirectMessage[] = [
          { id: "user1", name: "Maria Kowalska", avatar: "/placeholder.svg", status: "online", unreadCount: 3 },
          { id: "user2", name: "John Doe", avatar: "/placeholder.svg", status: "offline", unreadCount: 0 },
          { id: "user3", name: "Alex Smith", avatar: "/placeholder.svg", status: "online", unreadCount: 0 },
          { id: "user4", name: "Sara Johnson", avatar: "/placeholder.svg", status: "offline", unreadCount: 1 }
        ];
        
        setDirectMessages(dummyUsers);
        
      } catch (error) {
        toast.error("Failed to load chat data");
        console.error(error);
      }
    }
    
    loadChannelsAndUsers();
  }, [user]);

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

  // For reactions
  const [reactionMessageId, setReactionMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Extract just the emoji symbols
  const emojiSymbols = ["👍", "❤️", "😊", "🎉", "😂", "🤔"];

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
        <p className="text-muted-foreground">
          Communicate in real-time with your team members.
        </p>
      </div>
      
      <div className="flex flex-1 gap-4 h-full">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden absolute top-4 right-4 z-20">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Sidebar */}
        <ChatSidebar
          channels={channels}
          directMessages={directMessages}
          activeChat={activeChat}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSelectChat={(chatId, chatName, type) => handleSelectChat(chatId, chatName, type)}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        
        {/* Chat Area */}
        <ChatArea
          activeChat={activeChat}
          activeTab={activeTab}
          messages={messages}
          message={messageInput}
          typingStatus={typingStatus}
          handleChangeMessage={handleChangeMessage}
          handleSendMessage={handleSendMessage}
          toggleSidebar={toggleSidebar}
          emojis={emojiSymbols}
          onAddReaction={addReaction}
          reactionMessageId={reactionMessageId}
          setReactionMessageId={setReactionMessageId}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default TeamChat;
