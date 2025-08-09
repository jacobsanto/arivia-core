
import React, { memo, useEffect, useState } from "react";
import { Message } from "@/hooks/useChatTypes";
import EmojiPicker from "../emoji/EmojiPicker";
import MessageReactions from "../emoji/MessageReactions";
import { Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MessageContentProps {
  message: Message;
  emojis: string[];
  isHoveringMessage: boolean;
  setIsHoveringMessage: (hovering: boolean) => void;
  handleMessageMouseEnter: () => void;
  handleMessageMouseLeave: () => void;
  handleEmojiClick: (emoji: string, e: React.MouseEvent) => void;
  reactionMessageId: string | null;
  showEmojiPicker: boolean;
  handlePickerMouseEnter: () => void;
  handlePickerMouseLeave: () => void;
}

const MessageContent: React.FC<MessageContentProps> = ({
  message,
  emojis,
  handleMessageMouseEnter,
  handleMessageMouseLeave,
  handleEmojiClick,
  reactionMessageId,
  showEmojiPicker,
  handlePickerMouseEnter,
  handlePickerMouseLeave,
}) => {
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const signAll = async () => {
      if (!hasAttachments) return;
      const results: Record<string, string> = {};
      for (const att of message.attachments!) {
        const url = att.url;
        if (!url) continue;
        // If already an http(s) URL, use as-is
        if (/^https?:\/\//i.test(url)) {
          results[att.id] = url;
          continue;
        }
        // Otherwise treat as storage path in chat-attachments bucket
        try {
          const { data } = await supabase.storage
            .from('chat-attachments')
            .createSignedUrl(url, 60 * 60);
          if (data?.signedUrl) results[att.id] = data.signedUrl;
        } catch {
          // ignore
        }
      }
      if (!cancelled) setSignedUrls(results);
    };
    signAll();
    return () => { cancelled = true; };
  }, [hasAttachments, message.attachments]);
  
  return (
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
        
        {hasAttachments && (
          <div className="mt-2 space-y-2">
            {message.attachments!.map(attachment => {
              const resolvedUrl = signedUrls[attachment.id] || attachment.url;
              return (
                <div key={attachment.id} className="flex flex-col">
                  {attachment.type.startsWith('image/') ? (
                    <a 
                      href={resolvedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-block"
                    >
                      <img 
                        src={resolvedUrl} 
                        alt={attachment.name} 
                        className="max-h-48 max-w-full rounded-md object-cover" 
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <a 
                      href={resolvedUrl} 
                      download={attachment.name}
                      className="flex items-center gap-2 py-1 px-2 bg-background/20 backdrop-blur-sm rounded text-xs hover:bg-background/30 transition-colors"
                    >
                      <Paperclip className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{attachment.name}</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <MessageReactions 
        reactions={message.reactions || {}} 
        onEmojiClick={handleEmojiClick} 
      />
      
      {!message.isCurrentUser && reactionMessageId === message.id && showEmojiPicker && (
        <EmojiPicker
          emojis={emojis}
          onEmojiClick={handleEmojiClick}
          onMouseEnter={handlePickerMouseEnter}
          onMouseLeave={handlePickerMouseLeave}
        />
      )}
    </div>
  );
};

export default memo(MessageContent);
