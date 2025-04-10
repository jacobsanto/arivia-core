
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { User } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, UserCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    updateUserAvatar
  } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Standardized size classes
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };
  
  // Add timestamp to avatar URL for cache busting
  const getAvatarUrl = (url: string | undefined) => {
    if (!url) return "/placeholder.svg";
    
    // Skip cache busting for placeholder images
    if (url.includes('placeholder.svg')) return url;
    
    // Add cache busting timestamp
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);

      // Make sure the file is an image and not too large
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size should be less than 2MB');
      }

      // Upload to Supabase Storage
      const userId = user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      console.log("Attempting to upload to bucket 'avatars' at path:", filePath);
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });
      
      if (error) {
        console.error("Storage error details:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (publicUrlData?.publicUrl) {
        // Add a timestamp to bust cache
        const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

        console.log("File uploaded successfully. Public URL:", avatarUrl);

        // Update user profile with new avatar URL
        await updateUserAvatar(userId, avatarUrl);

        // Call the callback if provided
        if (onAvatarChange) {
          onAvatarChange(avatarUrl);
        }
        
        toast.success("Avatar updated successfully");
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (!editable) {
    return (
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={getAvatarUrl(user.avatar)} 
          alt={user.name || "User"} 
          className="object-cover object-center" 
        />
        <AvatarFallback>{getInitials(user.name || "User")}</AvatarFallback>
      </Avatar>
    );
  }
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer group">
          <Avatar className={sizeClasses[size]}>
            <AvatarImage 
              src={getAvatarUrl(user.avatar)} 
              alt={user.name || "User"} 
              className="object-cover object-center"
            />
            <AvatarFallback>{getInitials(user.name || "User")}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-1 group-hover:bg-primary/10 transition-colors">
            <Camera className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="h-40 w-40">
            <AvatarImage 
              src={getAvatarUrl(user.avatar)} 
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
              <input type="file" accept="image/*" disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUpload;
