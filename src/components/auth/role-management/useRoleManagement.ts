
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/auth";
import { useExpandedUsers } from "./hooks/useExpandedUsers";
import { useRoleActions } from "./hooks/useRoleActions";
import { useUserDeletion } from "./hooks/useUserDeletion";
import { useUserData } from "./hooks/useUserData";

export const useRoleManagement = () => {
  // Get user data and loading state
  const { users, isLoading } = useUserData();
  const { user: currentUser } = useAuth();
  
  // Get role actions functionality
  const roleActions = useRoleActions();
  
  // Get user deletion functionality
  const { userToDelete, isDeleting, isDeletingAll, setUserToDelete, handleDeleteConfirm, handleDeleteAllUsers } = useUserDeletion();
  
  // Get expanded users functionality
  const { expandedUsers, toggleExpandUser } = useExpandedUsers();
  
  // Extract selected user's permissions
  const handleEditPermissions = (user: User) => {
    // Just return the user to allow permission editing
    return user;
  };

  // Function to delete all users except the current user
  const deleteAllUsers = async () => {
    if (!currentUser || !users.length) return false;
    return await handleDeleteAllUsers(users, currentUser.id);
  };
  
  return {
    // User data
    users,
    isLoading,
    currentUser,
    
    // Role actions
    ...roleActions,
    
    // User deletion
    userToDelete,
    isDeleting,
    isDeletingAll,
    setUserToDelete,
    handleDeleteConfirm,
    deleteAllUsers,
    
    // Expanded users
    expandedUsers,
    toggleExpandUser,
    
    // Permission editing
    handleEditPermissions
  };
};
