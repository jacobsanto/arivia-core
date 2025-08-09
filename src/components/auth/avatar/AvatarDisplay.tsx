import React, { useEffect, useMemo, useState } from "react";
import { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
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
  const [signedUrl, setSignedUrl] = useState<string>("/placeholder.svg");

  const displayName = user?.name || "User";
  const rawAvatar = user?.avatar || "/placeholder.svg";

  useEffect(() => {
    let isMounted = true;
    const loadUrl = async () => {
      if (!rawAvatar || rawAvatar.includes('placeholder.svg')) {
        if (isMounted) setSignedUrl("/placeholder.svg");
        return;
      }
      // If it's an http(s) URL, use as-is
      if (/^https?:\/\//i.test(rawAvatar)) {
        if (isMounted) setSignedUrl(`${rawAvatar}`);
        return;
      }
      // Otherwise treat as storage path in the avatars bucket
      try {
        const { data } = await supabase.storage
          .from('avatars')
          .createSignedUrl(rawAvatar, 60 * 60);
        if (isMounted) setSignedUrl(data?.signedUrl || "/placeholder.svg");
      } catch {
        if (isMounted) setSignedUrl("/placeholder.svg");
      }
    };
    loadUrl();
    return () => { isMounted = false; };
  }, [rawAvatar]);
  
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