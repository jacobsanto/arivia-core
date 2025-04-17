
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, WifiOff } from "lucide-react";

interface MessageInputProps {
  message: string;
  activeChat: string;
  handleChangeMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isOffline?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  activeChat,
  handleChangeMessage,
  handleSendMessage,
  isOffline = false,
}) => {
  return (
    <form onSubmit={handleSendMessage} className="border-t p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={handleChangeMessage}
            placeholder={isOffline ? "Offline mode - messages will not be sent" : `Message ${activeChat}...`}
            className="min-h-[80px] resize-none"
          />
        </div>
        <Button 
          type="submit"
          size="icon"
          variant="default"
          disabled={!message.trim().length}
          className="h-10 w-10"
        >
          {isOffline ? <WifiOff className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
