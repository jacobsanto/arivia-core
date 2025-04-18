
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteAllUsersDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  userCount: number;
  onCancel: () => void;
  onConfirm: () => Promise<boolean>;
}

const DeleteAllUsersDialog: React.FC<DeleteAllUsersDialogProps> = ({
  isOpen,
  isDeleting,
  userCount,
  onCancel,
  onConfirm
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isDeleting && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Delete All Users</span>
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete all {userCount} users in the system except your account.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="p-3 border rounded-md bg-amber-50 text-amber-900 space-y-2">
            <p className="font-medium">Warning:</p>
            <p className="text-sm">
              Deleting all users will remove all user accounts and their associated data.
              This is designed for development purposes only.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting All Users..." : "Delete All Users"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAllUsersDialog;
