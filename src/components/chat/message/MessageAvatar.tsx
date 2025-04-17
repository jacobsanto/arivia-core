
import React from "react";
import AvatarComponent from "@/components/auth/avatar/AvatarComponent";
import { UserRole } from "@/types/auth";

interface MessageAvatarProps {
  sender: string;
  avatar: string;
  isCurrentUser: boolean;
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ sender, avatar, isCurrentUser }) => {
  return (
    <AvatarComponent
      user={{ 
        name: sender, 
        avatar, 
        id: "", 
        email: "", 
        role: "user" as UserRole 
      }}
      size="sm"
      className={`h-8 w-8 ${isCurrentUser ? "ml-2" : "mr-2"}`}
    />
  );
};

export default MessageAvatar;
