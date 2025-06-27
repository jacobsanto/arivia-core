
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user, updateAvatar } = useUser();

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
        toast.success("Avatar updated successfully");
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

  return {
    uploadAvatar,
    isUploading
  };
};
