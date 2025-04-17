
import React from "react";
import { User } from "@/types/auth";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, UserCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AvatarComponent from "./AvatarComponent";

interface AvatarUploadDialogProps {
  user: User;
  isUploading: boolean;
  avatarUrl: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadError?: string | null;
}

const AvatarUploadDialog: React.FC<AvatarUploadDialogProps> = ({
  user,
  isUploading,
  avatarUrl,
  onFileChange,
  uploadError = null
}) => {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Update Profile Picture</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center space-y-4 py-4">
        <div className="h-40 w-40">
          <AvatarComponent 
            user={{...user, avatar: avatarUrl}} 
            size="lg" 
            className="h-40 w-40"
          />
        </div>
        
        {uploadError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Upload a new profile picture. JPG, PNG or GIF. Max 2MB.
          </p>
          
          <label className="relative">
            <Button disabled={isUploading} variant="outline" type="button" className="flex gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UserCircle2 className="h-4 w-4" />
                  <span>Choose Image</span>
                </>
              )}
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
      <DialogFooter className="flex justify-between sm:justify-end">
        <Button variant="ghost" type="button" disabled={isUploading}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AvatarUploadDialog;
