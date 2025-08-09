import React from "react";
import { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSignedUrl } from "@/hooks/useSignedUrl";

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
  const displayName = user?.name || "User";
  const rawAvatar = user?.avatar || "/placeholder.svg";
  const { url: signedUrl } = useSignedUrl(rawAvatar, { fallbackBucket: 'User Avatars', expiresInSeconds: 60 * 60 });

  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={signedUrl} alt={displayName} />
      <AvatarFallback className="bg-muted">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
};
export default AvatarDisplay;