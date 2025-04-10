
import React from "react";
import { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, UserCircle2 } from "lucide-react";
import { getInitials } from "./AvatarDisplay";

interface AvatarUploadDialogProps {
  user: User;
  isUploading: boolean;
  avatarUrl: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AvatarUploadDialog: React.FC<AvatarUploadDialogProps> = ({
  user,
  isUploading,
  avatarUrl,
  onFileChange
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Update Profile Picture</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center space-y-4 py-4">
        <Avatar className="h-40 w-40">
          <AvatarImage 
            src={avatarUrl} 
            alt={user.name || "User"} 
            className="object-cover object-center"
          />
          <AvatarFallback className="text-4xl">{getInitials(user.name || "User")}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Upload a new profile picture. JPG, PNG or GIF. Max 2MB.
          </p>
          
          <label className="relative">
            <Button disabled={isUploading} variant="outline" type="button" className="flex gap-2">
              {isUploading ? <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </> : <>
                  <UserCircle2 className="h-4 w-4" />
                  Choose Image
                </>}
            </Button>
            <input 
              type="file" 
              accept="image/*" 
              disabled={isUploading} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={onFileChange} 
            />
          </label>
        </div>
      </div>
    </DialogContent>
  );
};

export default AvatarUploadDialog;
