import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageReaction } from '@/types/chat.types';
import { Plus, Smile } from 'lucide-react';
import EmojiPicker from './emoji/EmojiPicker';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId?: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (reactionId: string) => void;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Group reactions by emoji
  const reactionGroups = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

  const handleEmojiClick = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if current user already reacted with this emoji
    const existingReaction = reactions.find(
      r => r.userId === currentUserId && r.emoji === emoji
    );

    if (existingReaction) {
      onRemoveReaction(existingReaction.id);
    } else {
      onAddReaction(emoji);
    }
  };

  const handleAddReaction = (emoji: string) => {
    onAddReaction(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {/* Existing Reactions */}
      {Object.entries(reactionGroups).map(([emoji, groupReactions]) => {
        const hasReacted = groupReactions.some(r => r.userId === currentUserId);
        const count = groupReactions.length;
        
        return (
          <button
            key={emoji}
            onClick={(e) => handleEmojiClick(emoji, e)}
            className={`
              text-xs px-2 py-1 rounded-full border flex items-center gap-1
              transition-all duration-200 hover:scale-105
              ${hasReacted 
                ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' 
                : 'bg-background border-border hover:bg-muted hover:border-muted-foreground/20'
              }
            `}
            title={groupReactions.map(r => r.user.name).join(', ')}
          >
            <span className="text-sm">{emoji}</span>
            <span className="font-medium">{count}</span>
          </button>
        );
      })}

      {/* Add Reaction Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full hover:bg-muted"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Plus className="h-3 w-3" />
        </Button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker
            emojis={commonEmojis}
            onEmojiClick={handleAddReaction}
            onMouseEnter={() => {}}
            onMouseLeave={() => setShowEmojiPicker(false)}
          />
        )}
      </div>
    </div>
  );
};
