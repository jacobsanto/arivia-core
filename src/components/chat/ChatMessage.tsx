
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, Heart, Waves, PartyPopper, HandMetal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  
  // Track if we're hovering over the emoji picker
  const handlePickerMouseEnter = () => {
    setShowEmojiPicker(true);
  };
  
  // Track mouse leaving the message
  const handleMessageMouseLeave = () => {
    // Only close if mouse is not over the picker
    setTimeout(() => {
      if (reactionMessageId === message.id) {
        setShowEmojiPicker(false);
      }
    }, 200);
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
              onMouseEnter={() => {
                setReactionMessageId(message.id);
                setShowEmojiPicker(true);
              }}
              onMouseLeave={handleMessageMouseLeave}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            
            {/* Emoji reactions display with minimal design */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="flex mt-1 flex-wrap gap-1">
                {Object.entries(message.reactions).map(([emoji, users]) => 
                  users.length > 0 ? (
                    <Badge 
                      key={emoji} 
                      variant="outline"
                      className="flex items-center gap-1 h-6 px-2 hover:bg-secondary/80 transition-colors cursor-pointer bg-background"
                      title={users.join(', ')}
                      onClick={() => onAddReaction(message.id, emoji)}
                    >
                      {getReactionIcon(emoji)}
                      <span className="text-xs">{users.length}</span>
                    </Badge>
                  ) : null
                )}
              </div>
            )}
            
            {/* Improved emoji picker with better mouse interaction */}
            {reactionMessageId === message.id && showEmojiPicker && (
              <div 
                className="absolute bottom-full mb-2 bg-background/95 shadow-lg rounded-lg border border-border p-1.5 flex z-10"
                onMouseEnter={handlePickerMouseEnter}
                onMouseLeave={() => {
                  setTimeout(() => setShowEmojiPicker(false), 200);
                }}
              >
                {emojis.map(emoji => (
                  <button 
                    key={emoji} 
                    className="hover:bg-secondary rounded-md p-1.5 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddReaction(message.id, emoji);
                      setShowEmojiPicker(false);
                      setReactionMessageId(null);
                    }}
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
