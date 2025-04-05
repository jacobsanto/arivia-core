import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, Heart, Waves, PartyPopper, HandMetal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageReaction {
  [emoji: string]: string[];
}

export interface Message {
  id: number;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: MessageReaction;
}

interface ChatMessageProps {
  message: Message;
  emojis: string[];
  onAddReaction: (messageId: number, emoji: string) => void;
  reactionMessageId: number | null;
  setReactionMessageId: (id: number | null) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  emojis,
  onAddReaction,
  reactionMessageId,
  setReactionMessageId,
  showEmojiPicker,
  setShowEmojiPicker,
}) => {
  // Track mouse events with local state for better reliability
  const [isHoveringMessage, setIsHoveringMessage] = useState(false);
  const [isHoveringPicker, setIsHoveringPicker] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [leaveTimer, setLeaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Map emoji characters to minimal Lucide icons with consistent styling
  const getReactionIcon = (emoji: string) => {
    switch (emoji) {
      case "👍": return <ThumbsUp className="w-3 h-3 stroke-[1.5]" />;
      case "❤️": return <Heart className="w-3 h-3 stroke-[1.5]" />;
      case "😂": return <ThumbsUp className="w-3 h-3 stroke-[1.5] rotate-180" />; // Using thumbs up rotated as a stand-in
      case "🎉": return <PartyPopper className="w-3 h-3 stroke-[1.5]" />;
      case "👋": return <Waves className="w-3 h-3 stroke-[1.5]" />;
      case "🙏": return <HandMetal className="w-3 h-3 stroke-[1.5]" />; // Using as alternative
      default: return emoji;
    }
  };
  
  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [hoverTimer, leaveTimer]);
  
  // Handle showing reaction picker with delay to prevent flickering
  const handleMessageMouseEnter = () => {
    // Don't show reaction picker for own messages
    if (message.isCurrentUser) {
      return;
    }
    
    setIsHoveringMessage(true);
    
    // Clear any existing leave timer
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      setLeaveTimer(null);
    }
    
    // Set a short delay before showing picker to prevent flickering
    const timer = setTimeout(() => {
      setReactionMessageId(message.id);
      setShowEmojiPicker(true);
    }, 300);
    
    setHoverTimer(timer);
  };
  
  // Handle mouse leaving message bubble
  const handleMessageMouseLeave = () => {
    setIsHoveringMessage(false);
    
    // Clear any existing hover timer
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    
    // Only hide picker if not hovering over the picker itself after a short delay
    const timer = setTimeout(() => {
      if (!isHoveringPicker) {
        setShowEmojiPicker(false);
      }
    }, 300);
    
    setLeaveTimer(timer);
  };
  
  // Handle mouse entering reaction picker
  const handlePickerMouseEnter = () => {
    setIsHoveringPicker(true);
    
    // Clear any existing leave timer
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      setLeaveTimer(null);
    }
  };
  
  // Handle mouse leaving reaction picker
  const handlePickerMouseLeave = () => {
    setIsHoveringPicker(false);
    
    // Only hide if not hovering over the message after a short delay
    const timer = setTimeout(() => {
      if (!isHoveringMessage) {
        setShowEmojiPicker(false);
      }
    }, 300);
    
    setLeaveTimer(timer);
  };
  
  // Handle emoji selection
  const handleEmojiClick = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Add the reaction
    onAddReaction(message.id, emoji);
  };

  return (
    <div
      key={message.id}
      className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[80%] ${
          message.isCurrentUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Avatar className={`h-8 w-8 ${message.isCurrentUser ? "ml-2" : "mr-2"}`}>
          <AvatarImage src={message.avatar} alt={message.sender} />
          <AvatarFallback>{message.sender[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="relative">
            <div
              className={`px-4 py-3 rounded-md ${
                message.isCurrentUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
              onMouseEnter={handleMessageMouseEnter}
              onMouseLeave={handleMessageMouseLeave}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            
            {/* Emoji reactions display with minimal design */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="flex mt-1 flex-wrap gap-1">
                {Object.entries(message.reactions).map(([emoji, users]) => 
                  users.length > 0 ? (
                    <TooltipProvider key={emoji}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="outline"
                            className="flex items-center gap-1 h-6 px-2 hover:bg-secondary/80 transition-colors cursor-pointer bg-background"
                            onClick={(e) => handleEmojiClick(emoji, e)}
                          >
                            {getReactionIcon(emoji)}
                            <span className="text-xs">{users.length}</span>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{users.join(', ')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : null
                )}
              </div>
            )}
            
            {/* Only show emoji picker for messages that aren't from the current user */}
            {!message.isCurrentUser && reactionMessageId === message.id && showEmojiPicker && (
              <div 
                className="absolute bottom-full mb-2 bg-background/95 shadow-lg rounded-lg border border-border p-1.5 flex z-10"
                onMouseEnter={handlePickerMouseEnter}
                onMouseLeave={handlePickerMouseLeave}
              >
                {emojis.map(emoji => (
                  <button 
                    key={emoji} 
                    className="hover:bg-secondary rounded-md p-1.5 transition-colors"
                    onClick={(e) => handleEmojiClick(emoji, e)}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className={`flex text-xs text-muted-foreground mt-1 ${
              message.isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            <span>
              {new Date(message.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
