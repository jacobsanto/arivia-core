
import { User, UserRole } from "@/types/auth";
import { toast } from "sonner";

/**
 * Update a user's role
 */
export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  try {
    // Get users from localStorage
    const storedUsers = localStorage.getItem("users");
    if (!storedUsers) {
      return false;
    }
    
    const users = JSON.parse(storedUsers);
    
    // Find the user to update
    const userIndex = users.findIndex((u: User) => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    
    // Update the user's role and remove pending approval flag
    users[userIndex] = {
      ...users[userIndex],
      role: newRole,
      pendingApproval: false
    };
    
    // Save updated users to localStorage
    localStorage.setItem("users", JSON.stringify(users));

    // Update current user if it's the same user
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      if (parsedUser.id === userId) {
        const updatedUser = {
          ...parsedUser,
          role: newRole,
          pendingApproval: false
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }
    
    // Show success toast
    toast.success("User role updated", {
      description: `User has been approved with ${newRole} role.`
    });
    
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    toast.error("Failed to update user role");
    return false;
  }
};

/**
 * Get all users from localStorage
 */
export const getAllUsers = (): User[] => {
  const storedUsers = localStorage.getItem("users");
  return storedUsers ? JSON.parse(storedUsers) : [];
};

/**
 * Get pending users
 */
export const getPendingUsers = (): User[] => {
  const allUsers = getAllUsers();
  return allUsers.filter(user => user.pendingApproval === true);
};
