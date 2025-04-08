
import { User } from '@/types/auth';
import { toastService } from '@/services/toast/toast.service';
import { offlineManager } from '@/utils/offlineManager';

/**
 * Upload and process user avatar
 */
export const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
  try {
    // In a real app, this would upload to a server/storage service
    // For now, we'll convert to base64 and store locally
    const base64 = await fileToBase64(file);
    
    // Store the avatar in localStorage (simulating a database)
    const storedUsers = localStorage.getItem("users");
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Find and update the user
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error("User not found");
    }
    
    // Update the user with new avatar
    users[userIndex] = {
      ...users[userIndex],
      avatar: base64
    };
    
    // Save back to localStorage
    localStorage.setItem("users", JSON.stringify(users));
    
    // Update current user if it's the same user
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      if (parsedUser.id === userId) {
        const updatedUser = {
          ...parsedUser,
          avatar: base64
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    }
    
    // Cache the avatar for offline use
    await offlineManager.cacheUserAvatar(userId, base64);
    
    // Return the avatar URL (in this case, the base64 string)
    return base64;
  } catch (error) {
    console.error("Error updating avatar:", error);
    toastService.error("Failed to update avatar");
    throw error;
  }
};

/**
 * Convert a File object to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get user avatar from cache or local storage
 */
export const getUserAvatar = (userId: string): string | null => {
  // First check offline cache
  const cachedAvatar = offlineManager.getUserAvatar(userId);
  if (cachedAvatar) return cachedAvatar;
  
  // If not in cache, check localStorage
  const storedUsers = localStorage.getItem("users");
  if (storedUsers) {
    const users = JSON.parse(storedUsers);
    const user = users.find((u: User) => u.id === userId);
    return user?.avatar || null;
  }
  
  return null;
};
