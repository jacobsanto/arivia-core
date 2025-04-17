
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageReactionsProps {
  reactions: Record<string, string[]>;
  onEmojiClick?: (emoji: string, e: React.MouseEvent) => void;
  isOffline?: boolean;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({ 
  reactions, 
  onEmojiClick,
  isOffline = false 
}) => {
  if (!reactions || Object.keys(reactions).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(reactions).map(([emoji, users]) => (
        <TooltipProvider key={emoji}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="px-2 py-0 text-xs flex items-center gap-1 cursor-default hover:bg-secondary/80"
                onClick={onEmojiClick ? (e) => onEmojiClick(emoji, e) : undefined}
              >
                <span>{emoji}</span>
                <span className="text-xs">{users.length}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {isOffline 
                ? 'Reaction details unavailable in offline mode'
                : users.length === 1
                  ? `${users[0]} reacted with ${emoji}`
                  : `${users.length} users reacted with ${emoji}`
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default MessageReactions;
