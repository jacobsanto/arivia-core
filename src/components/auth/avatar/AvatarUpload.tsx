
import React from 'react';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { useAvatarUpload } from './useAvatarUpload';

interface AvatarUploadProps {
  user: User;
  onAvatarChange?: (url: string) => void;
  size?: string;
  editable?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  user, 
  onAvatarChange, 
  size = 'w-20 h-20',
  editable = true 
}) => {
  const {
    handleFileChange,
    isUploading,
    isDialogOpen,
    setIsDialogOpen
  } = useAvatarUpload({ 
    userId: user.id, 
    onAvatarChange: onAvatarChange || (() => {})
  });

  if (!editable) {
    return (
      <Avatar className={size}>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-lg">
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <Avatar className={size}>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Avatar</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <Avatar className="w-32 h-32">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Choose Photo'}
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUpload;
