
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Smile, Image } from "lucide-react";

interface MessageInputProps {
  message: string;
  activeChat: string;
  handleChangeMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: (e: React.FormEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  activeChat,
  handleChangeMessage,
  handleSendMessage,
}) => {
  return (
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
  );
};

export default MessageInput;
