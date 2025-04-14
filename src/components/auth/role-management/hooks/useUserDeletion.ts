
import { useState } from "react";
import { User } from "@/types/auth";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

export const useUserDeletion = () => {
  const { deleteUser } = useUser();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteConfirm = async (users: User[], setUsers: (users: User[]) => void) => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log("Starting delete operation for user:", userToDelete.id);
      
      const result = await deleteUser(userToDelete.id);
      
      if (result) {
        console.log("User deleted successfully, updating UI");
        // UI will be updated via the real-time subscription in useUserData
        setUserToDelete(null);
      } else {
        throw new Error("Delete operation failed");
      }
    } catch (error) {
      console.error("Error in handleDeleteConfirm:", error);
      toast.error("Failed to delete user", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
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
