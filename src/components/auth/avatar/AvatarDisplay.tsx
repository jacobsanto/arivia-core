
import React from "react";
import { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarDisplayProps {
  user: User;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Standardized size classes
const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-24 w-24",
  lg: "h-32 w-32"
};

// Helper function to get user initials for the fallback
export const getInitials = (name: string) => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
};

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  user,
  size = "md",
  className = ""
}) => {
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage 
        src={user.avatar || "/placeholder.svg"} 
        alt={user.name || "User"} 
        className="object-cover object-center" 
      />
      <AvatarFallback>{getInitials(user.name || "User")}</AvatarFallback>
    </Avatar>
  );
};

export default AvatarDisplay;
