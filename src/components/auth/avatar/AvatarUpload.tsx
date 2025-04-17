
import React from "react";
import { User } from "@/types/auth";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useAvatarUpload } from "./useAvatarUpload";
import AvatarUploadDialog from "./AvatarUploadDialog";
import AvatarComponent from "./AvatarComponent";

interface AvatarUploadProps {
  user: User;
  size?: "sm" | "md" | "lg";
  onAvatarChange?: (url: string) => void;
  editable?: boolean;
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  user,
  size = "md",
  onAvatarChange,
  editable = true,
  className = ""
}) => {
  const {
    avatarUrl,
    isUploading,
    isDialogOpen,
    setIsDialogOpen,
    handleFileChange,
    uploadError
  } = useAvatarUpload({
    user,
    onAvatarChange
  });
  
  if (!editable) {
    return (
      <AvatarComponent
        user={{...user, avatar: avatarUrl}}
        size={size}
        className={className}
      />
    );
  }
  
  const handleAvatarClick = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button className="bg-transparent border-0 p-0 m-0 cursor-pointer">
          <AvatarComponent
            user={{...user, avatar: avatarUrl}}
            size={size}
            editable={true}
            className={className}
            onAvatarClick={handleAvatarClick}
          />
        </button>
      </DialogTrigger>
      <AvatarUploadDialog 
        user={user}
        avatarUrl={avatarUrl}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        uploadError={uploadError}
      />
    </Dialog>
  );
};

export default AvatarUpload;
