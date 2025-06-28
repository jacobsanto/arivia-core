
import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

export const useAvatarUpload = (userId: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const { updateProfile } = useUser();

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a data URL for the uploaded file
      const reader = new FileReader();
      reader.onload = async (event) => {
        const avatarUrl = event.target?.result as string;
        
        try {
          // Update the user's avatar
          const success = await updateProfile(userId, { avatar: avatarUrl });
          
          if (success) {
            toast.success('Avatar updated successfully');
          } else {
            toast.error('Failed to update avatar');
          }
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

  return {
    handleAvatarUpload,
    isUploading
  };
};
