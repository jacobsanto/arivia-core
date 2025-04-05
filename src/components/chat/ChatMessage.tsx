
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
              onMouseEnter={() => setReactionMessageId(message.id)}
              onMouseLeave={() => {
                // Small delay to allow clicking emoji picker
                if (!showEmojiPicker) {
                  setReactionMessageId(null);
                }
              }}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            
            {/* Emoji reactions display */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="flex mt-1 flex-wrap gap-1">
                {Object.entries(message.reactions).map(([emoji, users]) => 
                  users.length > 0 ? (
                    <div 
                      key={emoji} 
                      className="flex items-center bg-secondary/50 rounded-full px-1.5 py-0.5 text-xs"
                      title={users.join(', ')}
                    >
                      <span className="mr-1">{emoji}</span>
                      <span>{users.length}</span>
                    </div>
                  ) : null
                )}
              </div>
            )}
            
            {/* Emoji picker */}
            {reactionMessageId === message.id && (
              <div className="absolute bottom-full mb-2 bg-background shadow-lg rounded-lg border p-1 flex">
                {emojis.map(emoji => (
                  <button 
                    key={emoji} 
                    className="hover:bg-secondary rounded p-1 text-lg"
                    onClick={() => onAddReaction(message.id, emoji)}
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
