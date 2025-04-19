
import React, { useMemo } from "react";
import { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarDisplayProps {
  user: User | { name: string; avatar?: string; id?: string };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-24 w-24",
  lg: "h-32 w-32"
};

export const getInitials = (name: string) => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
};

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  user,
  size = "md",
  className = ""
}) => {
  const avatarUrl = useMemo(() => {
    const url = user.avatar || "/placeholder.svg";
    if (!url || url.includes('placeholder.svg')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }, [user.avatar]);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage 
        src={avatarUrl} 
        alt={user.name || "User"} 
        className="object-center object-cover" 
      />
      <AvatarFallback>{getInitials(user.name || "User")}</AvatarFallback>
    </Avatar>
  );
};

export default AvatarDisplay;
