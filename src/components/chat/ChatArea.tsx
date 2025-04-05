
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Smile, Image, ChevronRight, Circle } from "lucide-react";
import ChatMessage, { Message } from "./ChatMessage";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatAreaProps {
  activeChat: string;
  activeTab: string;
  messages: Message[];
  message: string;
  typingStatus: string;
  handleChangeMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  toggleSidebar: () => void;
  emojis: string[];
  onAddReaction: (messageId: number, emoji: string) => void;
  reactionMessageId: number | null;
  setReactionMessageId: (id: number | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  activeChat,
  activeTab,
  messages,
  message,
  typingStatus,
  handleChangeMessage,
  handleSendMessage,
  toggleSidebar,
  emojis,
  onAddReaction,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
      <div className="border-b px-6 py-3 flex items-center justify-between">
        <div className="font-medium">
          {activeTab === "direct" ? (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder.svg" alt={activeChat} />
                <AvatarFallback>{activeChat[0]}</AvatarFallback>
              </Avatar>
              <span>{activeChat}</span>
            </div>
          ) : (
            <span>#{activeChat}</span>
          )}
        </div>
        
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={toggleSidebar}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              emojis={emojis}
              onAddReaction={onAddReaction}
              reactionMessageId={reactionMessageId}
              setReactionMessageId={setReactionMessageId}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
            />
          ))}
        </div>
        
        {/* Typing indicator */}
        {typingStatus && (
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <div className="flex space-x-1 items-center">
              <Circle className="h-2 w-2 animate-pulse" />
              <Circle className="h-2 w-2 animate-pulse delay-100" />
              <Circle className="h-2 w-2 animate-pulse delay-200" />
            </div>
            <span className="ml-2">{activeChat} is {typingStatus}</span>
          </div>
        )}
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="border-t p-4 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Textarea
            placeholder={`Message ${activeChat}...`}
            value={message}
            onChange={handleChangeMessage}
            className="flex-1 min-h-[80px] resize-none"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground" 
            >
              <Image className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <Button type="submit">
            <Send className="h-5 w-5 mr-2" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;
