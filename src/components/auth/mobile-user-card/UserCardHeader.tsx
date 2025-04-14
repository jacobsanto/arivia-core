
import React from "react";
import { User } from "@/types/auth";
import { ChevronDown, ChevronUp } from "lucide-react";
import AvatarUpload from "../avatar/AvatarUpload";

interface UserCardHeaderProps {
  user: User;
  isEditing: boolean;
  isExpanded: boolean;
  toggleExpand: (userId: string) => void;
}

const UserCardHeader: React.FC<UserCardHeaderProps> = ({
  user,
  isEditing,
  isExpanded,
  toggleExpand
}) => {
  return (
    <div 
      className="p-3 flex items-center justify-between cursor-pointer border-b"
      onClick={() => !isEditing && toggleExpand(user.id)}
    >
      <div className="flex items-center gap-2">
        <AvatarUpload user={user} size="sm" editable={false} />
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      {!isEditing && (
        <div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
};

export default UserCardHeader;
