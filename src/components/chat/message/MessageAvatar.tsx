
import React, { memo } from "react";
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
    <div className={`${isCurrentUser ? "ml-2" : "mr-2"} flex-shrink-0`}>
      <AvatarDisplay 
        user={user} 
        size="sm" 
        className="opacity-90 transition-opacity hover:opacity-100"
      />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(MessageAvatar);
