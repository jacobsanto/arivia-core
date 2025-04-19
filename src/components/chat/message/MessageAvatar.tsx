
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageAvatarProps {
  sender: string;
  avatar: string;
  isCurrentUser: boolean;
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ sender, avatar, isCurrentUser }) => {
  return (
    <Avatar className={`h-8 w-8 ${isCurrentUser ? "ml-2" : "mr-2"}`}>
      <AvatarImage src={avatar} alt={sender} />
      <AvatarFallback>{sender[0]}</AvatarFallback>
    </Avatar>
  );
};

export default MessageAvatar;
