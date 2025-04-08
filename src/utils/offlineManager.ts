/**
 * Offline Manager
 *
 * This utility helps manage data persistence for offline use. It caches
 * tasks, photos, and forms in localStorage, allowing users to continue
 * working even without an internet connection.
 */

/**
 * Cache a task for offline use
 */
const cacheTask = async (task: any): Promise<void> => {
  try {
    const tasks = localStorage.getItem('offline_tasks') || '[]';
    const taskList = JSON.parse(tasks);
    taskList.push(task);
    localStorage.setItem('offline_tasks', JSON.stringify(taskList));
  } catch (error) {
    console.error('Error caching task:', error);
  }
};

/**
 * Get all cached tasks
 */
const getTasks = (): any[] => {
  try {
    const tasks = localStorage.getItem('offline_tasks') || '[]';
    return JSON.parse(tasks);
  } catch (error) {
    console.error('Error retrieving cached tasks:', error);
    return [];
  }
};

/**
 * Cache a photo for offline use
 */
const cachePhoto = async (photo: any): Promise<void> => {
  try {
    const photos = localStorage.getItem('offline_photos') || '[]';
    const photoList = JSON.parse(photos);
    photoList.push(photo);
    localStorage.setItem('offline_photos', JSON.stringify(photoList));
  } catch (error) {
    console.error('Error caching photo:', error);
  }
};

/**
 * Get all cached photos
 */
const getPhotos = (): any[] => {
  try {
    const photos = localStorage.getItem('offline_photos') || '[]';
    return JSON.parse(photos);
  } catch (error) {
    console.error('Error retrieving cached photos:', error);
    return [];
  }
};

/**
 * Cache a form for offline use
 */
const cacheForm = async (form: any): Promise<void> => {
  try {
    const forms = localStorage.getItem('offline_forms') || '[]';
    const formList = JSON.parse(forms);
    formList.push(form);
    localStorage.setItem('offline_forms', JSON.stringify(formList));
  } catch (error) {
    console.error('Error caching form:', error);
  }
};

/**
 * Get all cached forms
 */
const getForms = (): any[] => {
  try {
    const forms = localStorage.getItem('offline_forms') || '[]';
    return JSON.parse(forms);
  } catch (error) {
    console.error('Error retrieving cached forms:', error);
    return [];
  }
};

/**
 * Clear all offline data
 */
const clearOfflineData = (): void => {
  try {
    localStorage.removeItem('offline_tasks');
    localStorage.removeItem('offline_photos');
    localStorage.removeItem('offline_forms');
    localStorage.removeItem('offline_user_avatars');
  } catch (error) {
    console.error('Error clearing offline data:', error);
  }
};

/**
 * Simulate syncing offline data with a server
 */
const syncOfflineData = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Simulating offline data sync...');
      // In a real application, you would send the cached data to your server here
      const tasks = getTasks();
      const photos = getPhotos();
      const forms = getForms();

      console.log('Tasks to sync:', tasks);
      console.log('Photos to sync:', photos);
      console.log('Forms to sync:', forms);

      // Clear the offline data after successful sync
      clearOfflineData();
      resolve();
    }, 2000);
  });
};

/**
 * Cache a user's avatar for offline use
 */
const cacheUserAvatar = async (userId: string, avatarUrl: string): Promise<void> => {
  try {
    const userAvatars = localStorage.getItem('offline_user_avatars') || '{}';
    const avatars = JSON.parse(userAvatars);
    
    avatars[userId] = {
      url: avatarUrl,
      timestamp: Date.now()
    };
    
    localStorage.setItem('offline_user_avatars', JSON.stringify(avatars));
  } catch (error) {
    console.error('Error caching user avatar:', error);
  }
};

/**
 * Get a cached user avatar
 */
const getUserAvatar = (userId: string): string | null => {
  try {
    const userAvatars = localStorage.getItem('offline_user_avatars') || '{}';
    const avatars = JSON.parse(userAvatars);
    
    return avatars[userId]?.url || null;
  } catch (error) {
    console.error('Error retrieving cached avatar:', error);
    return null;
  }
};

export const offlineManager = {
  cacheTask,
  getTasks,
  cachePhoto,
  getPhotos,
  cacheForm,
  getForms,
  clearOfflineData,
  syncOfflineData,
  cacheUserAvatar,
  getUserAvatar
};
