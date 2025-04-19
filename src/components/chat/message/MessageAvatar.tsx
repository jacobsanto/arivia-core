
import React from "react";
import AvatarDisplay from "@/components/auth/avatar/AvatarDisplay";
import { User } from "@/types/auth";

interface MessageAvatarProps {
  user: User;
  isCurrentUser: boolean;
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ user, isCurrentUser }) => {
  return (
    <div className={`${isCurrentUser ? "ml-2" : "mr-2"}`}>
      <AvatarDisplay user={user} size="sm" />
    </div>
  );
};

export default MessageAvatar;
