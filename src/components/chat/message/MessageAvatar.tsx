
import React from "react";
import AvatarDisplay from "@/components/auth/avatar/AvatarDisplay";

interface MessageAvatarProps {
  sender: string;
  avatar?: string;
  isCurrentUser: boolean;
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ sender, avatar, isCurrentUser }) => {
  const user = {
    name: sender,
    avatar: avatar,
    id: sender // Using sender as id since we don't have actual IDs
  };

  return (
    <div className={`${isCurrentUser ? "ml-2" : "mr-2"}`}>
      <AvatarDisplay user={user} size="sm" />
    </div>
  );
};

export default MessageAvatar;
