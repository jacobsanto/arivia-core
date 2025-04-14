
import { useState } from "react";
import { User } from "@/types/auth";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

export const useUserDeletion = () => {
  const { deleteUser } = useUser();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteConfirm = async () => {
    if (!userToDelete) {
      console.log("No user selected for deletion");
      return false;
    }
    
    try {
      setIsDeleting(true);
      console.log("Starting delete operation for user:", userToDelete.id);
      
      // Call the deleteUser function from the context
      const result = await deleteUser(userToDelete.id);
      
      if (result) {
        console.log("User deleted successfully");
        toast.success("User deleted successfully");
        
        // No need to update the users array here - will happen via realtime subscription
        setUserToDelete(null);
        return true;
      } else {
        throw new Error("Delete operation failed");
      }
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
  
  return {
    userToDelete,
    isDeleting,
    setUserToDelete,
    handleDeleteConfirm
  };
};
