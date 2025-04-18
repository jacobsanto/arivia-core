
import React from "react";
import { User, ROLE_DETAILS } from "@/types/auth";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import AvatarUpload from "../avatar/AvatarUpload";

interface UserDeleteDialogProps {
  userToDelete: User | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void | boolean>;
}

const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({
  userToDelete,
  isDeleting,
  onCancel,
  onConfirm
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };
  
  if (!userToDelete) {
    return null;
  }
  
  return (
    <Dialog open={!!userToDelete} onOpenChange={open => !open && !isDeleting && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The user account will be permanently deleted from the system.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-4 mb-4">
            <AvatarUpload user={userToDelete} editable={false} />
            <div>
              <h3 className="font-medium">{userToDelete.name}</h3>
              <p className="text-sm text-muted-foreground">{userToDelete.email}</p>
              <Badge variant="outline" className="mt-1">
                {ROLE_DETAILS[userToDelete.role].title}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-destructive font-medium">
            Are you sure you want to delete this user?
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Deleting...</span>
              </span>
            ) : (
              <span>Delete User</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDeleteDialog;
