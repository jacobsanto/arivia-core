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
import AvatarUpload from "../avatar/AvatarUpload";

interface UserDeleteDialogProps {
  userToDelete: User | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({
  userToDelete,
  isDeleting,
  onCancel,
  onConfirm
}) => {
  return (
    <Dialog open={!!userToDelete} onOpenChange={open => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The user account will be permanently deleted from the system.
          </DialogDescription>
        </DialogHeader>
        
        {userToDelete && (
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
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDeleteDialog;
