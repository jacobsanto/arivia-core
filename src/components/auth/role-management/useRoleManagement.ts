
import { useUser } from "@/contexts/UserContext";
import { User } from "@/types/auth";
import { useExpandedUsers } from "./hooks/useExpandedUsers";
import { useRoleActions } from "./hooks/useRoleActions";
import { useUserDeletion } from "./hooks/useUserDeletion";
import { useUserData } from "./hooks/useUserData";

export const useRoleManagement = () => {
  // Get user data and loading state
  const { users, isLoading } = useUserData();
  
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
  
  return {
    // User data
    users,
    isLoading,
    
    // Role actions
    ...roleActions,
    
    // User deletion
    userToDelete,
    isDeleting,
    setUserToDelete,
    handleDeleteConfirm,
    
    // Expanded users
    expandedUsers,
    toggleExpandUser,
    
    // Permission editing
    handleEditPermissions
  };
};
