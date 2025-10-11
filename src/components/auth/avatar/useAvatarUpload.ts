
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/services/logger';
import { toast } from "sonner";

interface UseAvatarUploadProps {
  user: User;
  onAvatarChange?: (url: string) => void;
}

export const useAvatarUpload = ({ user, onAvatarChange }: UseAvatarUploadProps) => {
  const { refreshAuthState } = useAuth();
  
  const updateUserAvatar = async (userId: string, avatarUrl: string) => {
    const { error } = await supabase.from('profiles').update({ avatar: avatarUrl }).eq('id', userId);
    return !error;
  };
  
  const refreshProfile = async () => {
    await refreshAuthState();
  };
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const previousAvatarRef = useRef<string>("");
  
  useEffect(() => {
    const newUrl = user.avatar || "/placeholder.svg";
    setAvatarUrl(newUrl);
    previousAvatarRef.current = newUrl;
  }, [user.avatar]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);

      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size should be less than 2MB');
      }

      const userId = user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`; // Add timestamp to filename
      const filePath = `${userId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: 'no-cache' // Disable caching
        });
      
      if (error) {
        logger.error("Storage error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (publicUrlData?.publicUrl) {
        // Update avatar in database
        await updateUserAvatar(userId, publicUrlData.publicUrl);
        
        // Update local state
        setAvatarUrl(publicUrlData.publicUrl);
        previousAvatarRef.current = publicUrlData.publicUrl;

        // Notify parent component
        if (onAvatarChange) {
          onAvatarChange(publicUrlData.publicUrl);
        }

        // Refresh profile to update all components
        await refreshProfile();
        
        toast.success("Avatar updated successfully");
        setIsDialogOpen(false);
      }
    } catch (error) {
      logger.error("Error uploading avatar:", error);
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
