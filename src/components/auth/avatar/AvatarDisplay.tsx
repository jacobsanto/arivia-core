import React, { useMemo } from "react";
import { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface AvatarDisplayProps {
  user: User | {
    name: string;
    avatar?: string;
    id?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}
const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-24 w-24",
  lg: "h-32 w-32"
};
export const getInitials = (name: string = "User") => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
};
const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  user,
  size = "md",
  className = ""
}) => {
  const avatarUrl = useMemo(() => {
    if (!user) return "/placeholder.svg";
    const url = user.avatar || "/placeholder.svg";
    if (!url || url.includes('placeholder.svg')) return url;
    return `${url}?t=${Date.now()}`; // Force cache invalidation
  }, [user?.avatar]);
  const displayName = user?.name || "User";
  return <Avatar className={`${sizeClasses[size]} ${className} bg-muted/30 flex items-center justify-center`}>
      <AvatarImage src={avatarUrl} alt={displayName} loading="eager" className="w-full h-full object-cover" />
      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
    </Avatar>;
};
export default AvatarDisplay;