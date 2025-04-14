
import { useUser } from "@/contexts/UserContext";
import { User } from "@/types/auth";
import { useExpandedUsers } from "./hooks/useExpandedUsers";
import { useRoleActions } from "./hooks/useRoleActions";
import { useUserDeletion } from "./hooks/useUserDeletion";
import { useUserData } from "./hooks/useUserData";
import { toast } from "sonner";

export const useRoleManagement = () => {
  // Get user data and loading state
  const { users, isLoading, setUsers } = useUserData();
  
  // Get role actions functionality
  const roleActions = useRoleActions();
  
  // Get user deletion functionality
  const { userToDelete, isDeleting, setUserToDelete, handleDeleteConfirm } = useUserDeletion();
  
  // Get expanded users functionality
  const { expandedUsers, toggleExpandUser } = useExpandedUsers();
  
  // Extract selected user's permissions
  const handleEditPermissions = (user: User) => {
    // Just return the user to allow permission editing
    return user;
  };
  
  // Handle user deletion confirm
  const handleDelete = async () => {
    console.log("Handling delete confirmation");
    try {
      await handleDeleteConfirm(users, setUsers);
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("Failed to delete user", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };
  
  return {
    // User data
    users,
    isLoading,
    setUsers,
    
    // Role actions
    ...roleActions,
    
    // User deletion
    userToDelete,
    isDeleting,
    setUserToDelete,
    handleDeleteConfirm: handleDelete,
    
    // Expanded users
    expandedUsers,
    toggleExpandUser,
    
    // Permission editing
    handleEditPermissions
  };
};
