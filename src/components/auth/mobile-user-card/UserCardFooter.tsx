
import React from "react";
import { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UserCardFooterProps {
  user: User;
  currentUser: User | null;
  onEditPermissions: (user: User) => void;
  onDeleteClick: (user: User) => void;
  handleEditRole: () => void;
}

const UserCardFooter: React.FC<UserCardFooterProps> = ({
  user,
  currentUser,
  onEditPermissions,
  onDeleteClick,
  handleEditRole
}) => {
  const handleDeleteClick = () => {
    if (user.id === currentUser?.id) {
      toast.error("Cannot delete your own account", {
        description: "You cannot delete your own user account"
      });
      return;
    }
    onDeleteClick(user);
  };
  
  return (
    <div className="flex flex-wrap gap-2 pt-0">
      <Button 
        size="sm" 
        variant="outline" 
        className="flex-1"
        onClick={() => onEditPermissions(user)}
      >
        Permissions
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="flex-1"
        onClick={handleEditRole}
      >
        Change Role
      </Button>
      {user.id !== currentUser?.id && (
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDeleteClick}
          className="flex-1"
        >
          <span className="flex items-center">
            <Trash2 className="h-4 w-4 mr-1" />
            <span>Delete</span>
          </span>
        </Button>
      )}
    </div>
  );
};

export default UserCardFooter;
