
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseAvatarUploadProps {
  user: User;
  onAvatarChange?: (url: string) => void;
}

export const useAvatarUpload = ({ user, onAvatarChange }: UseAvatarUploadProps) => {
  const { updateUserAvatar } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatar || "/placeholder.svg");
  const previousAvatarRef = useRef<string>(user.avatar || "/placeholder.svg");
  
  // Add timestamp to avatar URL for cache busting only when needed
  const getAvatarUrl = (url: string | undefined) => {
    if (!url) return "/placeholder.svg";
    
    // Skip cache busting for placeholder images
    if (url.includes('placeholder.svg')) return url;
    
    // Add cache busting timestamp
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };
  
  // Update timestamp only when avatar actually changes
  useEffect(() => {
    if (user.avatar !== previousAvatarRef.current) {
      const newUrl = getAvatarUrl(user.avatar);
      setAvatarUrl(newUrl);
      previousAvatarRef.current = user.avatar || "/placeholder.svg";
    }
  }, [user.avatar]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);

      // Make sure the file is an image and not too large
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size should be less than 2MB');
      }

      // Upload to Supabase Storage
      const userId = user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      console.log("Attempting to upload to bucket 'avatars' at path:", filePath);
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (error) {
        console.error("Storage error details:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (publicUrlData?.publicUrl) {
        // Add a timestamp to bust cache
        const newAvatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

        console.log("File uploaded successfully. Public URL:", newAvatarUrl);

        // Update user profile with new avatar URL
        await updateUserAvatar(userId, publicUrlData.publicUrl);
        
        // Update local state
        setAvatarUrl(newAvatarUrl);
        
        // Update previous avatar reference
        previousAvatarRef.current = publicUrlData.publicUrl;

        // Call the callback if provided
        if (onAvatarChange) {
          onAvatarChange(publicUrlData.publicUrl);
        }
        
        toast.success("Avatar updated successfully");
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    avatarUrl,
    isUploading,
    isDialogOpen,
    setIsDialogOpen,
    handleFileChange
  };
};
