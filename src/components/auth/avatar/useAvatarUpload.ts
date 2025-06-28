
import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

interface UseAvatarUploadParams {
  userId: string;
  onAvatarChange?: (url: string) => void;
}

export const useAvatarUpload = ({ userId, onAvatarChange }: UseAvatarUploadParams) => {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { updateProfile } = useUser();

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a data URL for the uploaded file
      const reader = new FileReader();
      reader.onload = async (event) => {
        const newAvatarUrl = event.target?.result as string;
        
        try {
          // Update the user's avatar
          await updateProfile({ avatar: newAvatarUrl });
          setAvatarUrl(newAvatarUrl);
          onAvatarChange?.(newAvatarUrl);
          toast.success('Avatar updated successfully');
          setIsDialogOpen(false);
        } catch (error) {
          console.error('Error updating avatar:', error);
          toast.error('Failed to update avatar');
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  return {
    handleAvatarUpload,
    isUploading,
    avatarUrl,
    isDialogOpen,
    setIsDialogOpen,
    handleFileChange
  };
};
