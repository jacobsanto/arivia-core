
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getReactionIcon } from "./ReactionIcons";

interface MessageReaction {
  [emoji: string]: string[];
}

interface MessageReactionsProps {
  reactions: MessageReaction;
  onEmojiClick: (emoji: string, e: React.MouseEvent) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onEmojiClick,
}) => {
  if (!reactions || Object.keys(reactions).length === 0) {
    return null;
  }

  return (
    <div className="flex mt-1 flex-wrap gap-1">
      {Object.entries(reactions).map(([emoji, users]) =>
        users.length > 0 ? (
          <TooltipProvider key={emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 h-6 px-2 hover:bg-secondary/80 transition-colors cursor-pointer bg-background"
                  onClick={(e) => onEmojiClick(emoji, e)}
                >
                  {getReactionIcon(emoji)}
                  <span className="text-xs">{users.length}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{users.join(", ")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null
      )}
    </div>
  );
};

export default MessageReactions;
