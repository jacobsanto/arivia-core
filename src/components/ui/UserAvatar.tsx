import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsers } from "@/hooks/useUsers";

interface UserAvatarProps {
  userId: string | null;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  showName = false, 
  size = "md",
  className = "" 
}) => {
  const { users } = useUsers();
  const user = userId ? users.find(u => u.id === userId) : null;

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  };

  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Avatar className={sizeClasses[size]}>
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        {showName && <span className="text-sm text-muted-foreground">Unassigned</span>}
      </div>
    );
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.role.replace('_', ' ')}</span>
        </div>
      )}
    </div>
  );
};