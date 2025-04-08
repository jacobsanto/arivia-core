
import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: (file: File) => Promise<void>;
  isUpdating?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload = ({ 
  currentAvatar, 
  onAvatarChange,
  isUpdating = false,
  size = 'md' 
}: AvatarUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', { description: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 5MB' });
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      await onAvatarChange(file);
    } catch (error) {
      toast.error('Failed to upload avatar', { 
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      setPreviewUrl(null);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const avatarUrl = previewUrl || currentAvatar;
  const initials = 'U';  // Default fallback

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-primary`}>
          <AvatarImage src={avatarUrl || undefined} alt="User avatar" />
          <AvatarFallback className="bg-muted">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 rounded-full shadow-md"
            onClick={triggerFileSelect}
            disabled={isUpdating}
          >
            <Camera className="h-4 w-4" />
          </Button>
          
          {previewUrl && (
            <Button 
              size="icon" 
              variant="destructive" 
              className="h-8 w-8 rounded-full shadow-md"
              onClick={clearPreview}
              disabled={isUpdating}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {isUpdating && (
        <p className="text-xs text-muted-foreground animate-pulse">Uploading...</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Click the camera icon to upload a profile picture
      </p>
    </div>
  );
};

export default AvatarUpload;
