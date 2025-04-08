
import React from "react";
import { User as UserType } from "@/types/auth";
import { ROLE_DETAILS } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarUserInfoProps {
  user: UserType;
}

const SidebarUserInfo = ({ user }: SidebarUserInfoProps) => {
  const isPending = user.pendingApproval === true;
  const userInitials = user.name ? user.name.substring(0, 1).toUpperCase() : 'U';
  
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex flex-col items-center">
        <Avatar className="w-12 h-12 mb-2 border-2 border-sidebar-accent-foreground/20">
          <AvatarImage src={user.avatar || undefined} alt={user.name} />
          <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm font-medium">{user.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-sidebar-muted px-2 py-1 bg-sidebar-accent rounded-full">
            {ROLE_DETAILS[user.role]?.title || user.role.replace('_', ' ')}
          </span>
          {isPending && (
            <span className="text-xs text-amber-800 px-2 py-1 bg-amber-100 rounded-full">
              Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarUserInfo;
