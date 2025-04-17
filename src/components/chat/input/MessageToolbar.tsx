
import React from "react";
import { Paperclip, Image, Smile, X } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface MessageToolbarProps {
  onFileClick: () => void;
  onImageClick: () => void;
  onEmojiToggle: () => void;
  showEmojiPicker: boolean;
  isOffline?: boolean;
  attachments?: Array<{id: string; type: string; preview: string}>;
  onRemoveAttachment?: (id: string) => void;
}

const MessageToolbar: React.FC<MessageToolbarProps> = ({
  onFileClick,
  onImageClick,
  onEmojiToggle,
  showEmojiPicker,
  isOffline = false,
  attachments = [],
  onRemoveAttachment
}) => {
  return (
    <div className="flex items-center space-x-1 px-2 py-1">
      <div className="flex space-x-1 mr-2">
        <ToolbarButton
          icon={<Paperclip className="h-4 w-4" />}
          label="Attach file"
          onClick={onFileClick}
          disabled={isOffline}
        />
        <ToolbarButton
          icon={<Image className="h-4 w-4" />}
          label="Attach image"
          onClick={onImageClick}
          disabled={isOffline}
        />
        <ToolbarButton
          icon={<Smile className="h-4 w-4" />}
          label="Add emoji"
          onClick={onEmojiToggle}
          active={showEmojiPicker}
        />
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-1 overflow-x-auto py-1 gap-2">
          {attachments.map((attachment) => (
            <div 
              key={attachment.id} 
              className="relative flex-shrink-0 h-8 w-8 rounded-md bg-muted flex items-center justify-center overflow-hidden border border-border"
            >
              {attachment.type.startsWith('image/') ? (
                <img 
                  src={attachment.preview} 
                  alt="Attachment preview" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <Paperclip className="h-3 w-3 text-muted-foreground" />
              )}
              <button 
                className="absolute top-0 right-0 h-4 w-4 rounded-full bg-background/90 flex items-center justify-center"
                onClick={() => onRemoveAttachment?.(attachment.id)}
                title="Remove attachment"
              >
                <X className="h-2 w-2" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageToolbar;
