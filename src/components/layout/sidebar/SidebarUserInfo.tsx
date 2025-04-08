
import React from "react";
import { User } from "lucide-react";
import { User as UserType } from "@/types/auth";
import { ROLE_DETAILS } from "@/types/auth";

interface SidebarUserInfoProps {
  user: UserType;
}

const SidebarUserInfo = ({ user }: SidebarUserInfoProps) => {
  const isPending = user.pendingApproval === true;
  
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-sidebar-accent flex items-center justify-center mb-2">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
          ) : (
            <User size={20} className="text-sidebar-accent-foreground" />
          )}
        </div>
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
