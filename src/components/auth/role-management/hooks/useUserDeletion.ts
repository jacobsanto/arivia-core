
import { useState } from "react";
import { User } from "@/types/auth";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

export const useUserDeletion = () => {
  const { deleteUser } = useUser();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  
  const handleDeleteConfirm = async () => {
    if (!userToDelete) {
      console.log("No user selected for deletion");
      return false;
    }
    
    try {
      setIsDeleting(true);
      console.log("Starting delete operation for user:", userToDelete.id);
      
      // Call the deleteUser function from the context
      await deleteUser(userToDelete.id);
      
      console.log("User deleted successfully");
      toast.success("User deleted successfully");
      
      // No need to update the users array here - will happen via realtime subscription
      setUserToDelete(null);
      return true;
    } catch (error) {
      console.error("Error in handleDeleteConfirm:", error);
      toast.error("Failed to delete user", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteAllUsers = async (users: User[], currentUserId: string) => {
    try {
      setIsDeletingAll(true);
      console.log("Starting deletion of all users except current user");
      
      const usersToDelete = users.filter(user => user.id !== currentUserId);
      let successCount = 0;
      let failCount = 0;
      
      for (const user of usersToDelete) {
        try {
          console.log(`Attempting to delete user: ${user.id} (${user.name})`);
          await deleteUser(user.id);
          successCount++;
          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error deleting user ${user.id}:`, error);
          failCount++;
        }
      }
      
      if (failCount === 0) {
        toast.success(`Successfully deleted all ${successCount} users`);
        return true;
      } else {
        toast.warning(`Deleted ${successCount} users, but failed to delete ${failCount} users`);
        return successCount > 0;
      }
    } catch (error) {
      console.error("Error in handleDeleteAllUsers:", error);
      toast.error("Failed to delete all users", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      return false;
    } finally {
      setIsDeletingAll(false);
    }
  };
  
  return {
    userToDelete,
    isDeleting,
    isDeletingAll,
    setUserToDelete,
    handleDeleteConfirm,
    handleDeleteAllUsers
  };
};
