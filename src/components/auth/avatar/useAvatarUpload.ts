
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { User } from "@/types/auth";

interface UseAvatarUploadProps {
  user: User;
  onAvatarChange?: (url: string) => void;
}

export const useAvatarUpload = ({ user, onAvatarChange }: UseAvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "/placeholder.svg");
  const { updateAvatar } = useUser();

  const uploadAvatar = async (file: File) => {
    if (!user) {
      toast.error("User not found");
      return false;
    }

    setIsUploading(true);
    try {
      // Mock upload for now - in real implementation, upload to storage
      const mockUrl = URL.createObjectURL(file);
      const success = await updateAvatar(user.id, mockUrl);
      
      if (success) {
        setAvatarUrl(mockUrl);
        onAvatarChange?.(mockUrl);
        toast.success("Avatar updated successfully");
        setIsDialogOpen(false);
        return true;
      } else {
        toast.error("Failed to update avatar");
        return false;
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload avatar");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (file: File) => {
    if (file) {
      uploadAvatar(file);
    }
  };

  return {
    uploadAvatar,
    isUploading,
    avatarUrl,
    isDialogOpen,
    setIsDialogOpen,
    handleFileChange
  };
};
