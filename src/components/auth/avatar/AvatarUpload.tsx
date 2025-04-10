
import React from "react";
import { User } from "@/types/auth";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import AvatarDisplay from "./AvatarDisplay";
import AvatarUploadDialog from "./AvatarUploadDialog";
import { useAvatarUpload } from "./useAvatarUpload";

interface AvatarUploadProps {
  user: User;
  size?: "sm" | "md" | "lg";
  onAvatarChange?: (url: string) => void;
  editable?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  user,
  size = "md",
  onAvatarChange,
  editable = true
}) => {
  const {
    avatarUrl,
    isUploading,
    isDialogOpen,
    setIsDialogOpen,
    handleFileChange
  } = useAvatarUpload({
    user,
    onAvatarChange
  });
  
  if (!editable) {
    return <AvatarDisplay user={{...user, avatar: avatarUrl}} size={size} />;
  }
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer group">
          <AvatarDisplay user={{...user, avatar: avatarUrl}} size={size} />
          <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-1 group-hover:bg-primary/10 transition-colors">
            <Camera className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </DialogTrigger>
      <AvatarUploadDialog 
        user={user}
        avatarUrl={avatarUrl}
        isUploading={isUploading}
        onFileChange={handleFileChange}
      />
    </Dialog>
  );
};

export default AvatarUpload;
