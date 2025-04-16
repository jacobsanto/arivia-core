
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";
import ChatSidebar, { Channel, DirectMessage } from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import { channels, directMessages, emojis } from "@/components/chat/ChatData";
import { useIsMobile } from "@/hooks/use-mobile";

const TeamChat = () => {
  const [activeChat, setActiveChat] = useState("Maria Kowalska");
  const [activeTab, setActiveTab] = useState("direct");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const {
    messages,
    message,
    typingStatus,
    handleChangeMessage,
    handleSendMessage,
    reactionMessageId,
    setReactionMessageId,
    showEmojiPicker,
    setShowEmojiPicker,
    addReaction
  } = useChatMessages(activeChat);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSelectChat = (chatName: string) => {
    setActiveChat(chatName);
    
    // Close sidebar on mobile after selecting chat
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Map the channels data to match the Channel interface
  const typedChannels: Channel[] = channels.map(channel => ({
    ...channel,
    status: "offline" // Add a default status since channels don't have online property
  }));

  // Map the directMessages data to match the DirectMessage interface
  const typedDirectMessages: DirectMessage[] = directMessages.map(dm => ({
    ...dm,
    status: dm.online ? "online" : "offline" // Convert boolean 'online' to status string
  }));

  // Extract just the emoji symbols for the ChatArea component
  const emojiSymbols = emojis.map(emoji => emoji.symbol);

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
          channels={typedChannels}
          directMessages={typedDirectMessages}
          activeChat={activeChat}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSelectChat={handleSelectChat}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        
        {/* Chat Area */}
        <ChatArea
          activeChat={activeChat}
          activeTab={activeTab}
          messages={messages}
          message={message}
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
        />
      </div>
    </div>
  );
};

export default TeamChat;
