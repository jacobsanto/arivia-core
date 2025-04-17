
import React, { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "./AvatarDisplay";

interface AvatarComponentProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  editable?: boolean;
  onAvatarClick?: () => void;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20"
};

const AvatarComponent: React.FC<AvatarComponentProps> = ({
  user,
  size = "md",
  className = "",
  editable = false,
  onAvatarClick
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Add cache busting for avatar URLs
  const getCacheBustedUrl = (url: string | null | undefined) => {
    if (!url) return null;
    
    // Skip cache busting for placeholder images
    if (url.includes('placeholder.svg')) return url;
    
    // Add cache busting timestamp
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };
  
  useEffect(() => {
    if (user?.avatar) {
      setIsLoading(true);
      setHasError(false);
      setAvatarUrl(getCacheBustedUrl(user.avatar));
    } else {
      setAvatarUrl(null);
      setIsLoading(false);
    }
  }, [user?.avatar]);
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleImageError = () => {
    console.error("Failed to load avatar:", user?.avatar);
    setIsLoading(false);
    setHasError(true);
    setAvatarUrl(null);
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (editable && onAvatarClick) {
      e.preventDefault();
      e.stopPropagation();
      onAvatarClick();
    }
  };
  
  if (!user) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }
  
  return (
    <div className="relative">
      {isLoading && (
        <div className={`${sizeClasses[size]} ${className} absolute top-0 left-0 flex items-center justify-center`}>
          <Skeleton className="h-full w-full rounded-full" />
        </div>
      )}
      
      <Avatar 
        className={`${sizeClasses[size]} ${className} ${editable ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        {avatarUrl ? (
          <AvatarImage 
            src={avatarUrl}
            alt={user.name || "User"} 
            className="object-cover object-center" 
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : null}
        <AvatarFallback className={size === "lg" ? "text-lg" : ""}>
          {getInitials(user.name || "User")}
        </AvatarFallback>
      </Avatar>
      
      {editable && (
        <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-1 group-hover:bg-primary/10 transition-colors">
          <div className="h-4 w-4 text-muted-foreground bg-secondary rounded-full flex items-center justify-center">
            <span className="h-2 w-2 bg-muted-foreground rounded-full"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarComponent;
