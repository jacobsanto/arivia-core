
import { toast } from "sonner";

// Types for offline data
interface OfflineData {
  tasks: OfflineTask[];
  photos: OfflinePhoto[];
  forms: OfflineForm[];
  timestamp: number;
}

interface OfflineTask {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  isSynced: boolean;
}

interface OfflinePhoto {
  id: string;
  relatedItemId: string; // ID of the task/form the photo is related to
  dataUrl: string; // Base64 string of the image
  createdAt: string;
  isSynced: boolean;
}

interface OfflineForm {
  id: string;
  formType: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isSynced: boolean;
}

// Main class to handle offline functionality
class OfflineManager {
  private storageKey: string = 'arivia_offline_data';
  private networkStatus: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    // Initialize offline data if not exists
    if (!localStorage.getItem(this.storageKey)) {
      this.resetOfflineData();
    }

    // Set up event listeners for online/offline status
    window.addEventListener('online', this.handleNetworkStatusChange.bind(this));
    window.addEventListener('offline', this.handleNetworkStatusChange.bind(this));
  }

  // Get offline data from localStorage
  private getOfflineData(): OfflineData {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : this.resetOfflineData();
  }

  // Save offline data to localStorage
  private saveOfflineData(data: OfflineData): void {
    localStorage.setItem(this.storageKey, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  }

  // Reset offline data
  private resetOfflineData(): OfflineData {
    const emptyData: OfflineData = {
      tasks: [],
      photos: [],
      forms: [],
      timestamp: Date.now()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(emptyData));
    return emptyData;
  }

  // Handle network status changes
  private handleNetworkStatusChange(): void {
    const isOnline = navigator.onLine;
    this.networkStatus = isOnline;
    
    if (isOnline) {
      toast.info("You're back online!", {
        description: "Syncing your data now..."
      });
      this.syncOfflineData();
    } else {
      toast.warning("You're offline", {
        description: "Don't worry, changes will be saved and synced when you're back online."
      });
    }
  }

  // Check if device is online
  public isOnline(): boolean {
    return this.networkStatus;
  }

  // Save a task offline
  public saveTask(task: OfflineTask): string {
    const data = this.getOfflineData();
    const taskId = task.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newTask: OfflineTask = {
      ...task,
      id: taskId,
      isSynced: false,
      updatedAt: new Date().toISOString()
    };
    
    // Update existing task or add new one
    const taskIndex = data.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex >= 0) {
      data.tasks[taskIndex] = newTask;
    } else {
      data.tasks.push(newTask);
    }
    
    this.saveOfflineData(data);
    return taskId;
  }

  // Save a photo offline (base64)
  public savePhoto(photo: Omit<OfflinePhoto, 'id' | 'isSynced' | 'createdAt'>): string {
    const data = this.getOfflineData();
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newPhoto: OfflinePhoto = {
      ...photo,
      id: photoId,
      isSynced: false,
      createdAt: new Date().toISOString()
    };
    
    data.photos.push(newPhoto);
    this.saveOfflineData(data);
    
    return photoId;
  }

  // Save a form offline
  public saveForm(form: Omit<OfflineForm, 'id' | 'isSynced' | 'updatedAt'>): string {
    const data = this.getOfflineData();
    const formId = form.id || `form_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newForm: OfflineForm = {
      ...form,
      id: formId,
      isSynced: false,
      updatedAt: new Date().toISOString()
    };
    
    // Update existing form or add new one
    const formIndex = data.forms.findIndex(f => f.id === formId);
    
    if (formIndex >= 0) {
      data.forms[formIndex] = newForm;
    } else {
      data.forms.push(newForm);
    }
    
    this.saveOfflineData(data);
    return formId;
  }

  // Get all offline tasks
  public getTasks(): OfflineTask[] {
    return this.getOfflineData().tasks;
  }

  // Get all offline photos
  public getPhotos(): OfflinePhoto[] {
    return this.getOfflineData().photos;
  }

  // Get all offline forms
  public getForms(): OfflineForm[] {
    return this.getOfflineData().forms;
  }

  // Check if there's any unsynced data
  public hasUnsyncedData(): boolean {
    const data = this.getOfflineData();
    return (
      data.tasks.some(task => !task.isSynced) ||
      data.photos.some(photo => !photo.isSynced) ||
      data.forms.some(form => !form.isSynced)
    );
  }

  // Sync all offline data when back online
  public async syncOfflineData(): Promise<void> {
    if (!this.networkStatus || this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      const data = this.getOfflineData();
      
      // Simulate API sync for tasks
      const unsyncedTasks = data.tasks.filter(task => !task.isSynced);
      if (unsyncedTasks.length > 0) {
        // In a real app, you would send these to your API
        console.log('Syncing tasks:', unsyncedTasks);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        // Mark tasks as synced
        data.tasks = data.tasks.map(task => ({
          ...task,
          isSynced: true
        }));
      }
      
      // Simulate API sync for photos
      const unsyncedPhotos = data.photos.filter(photo => !photo.isSynced);
      if (unsyncedPhotos.length > 0) {
        // In a real app, you would upload these to your API
        console.log('Syncing photos:', unsyncedPhotos);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        
        // Mark photos as synced
        data.photos = data.photos.map(photo => ({
          ...photo,
          isSynced: true
        }));
      }
      
      // Simulate API sync for forms
      const unsyncedForms = data.forms.filter(form => !form.isSynced);
      if (unsyncedForms.length > 0) {
        // In a real app, you would send these to your API
        console.log('Syncing forms:', unsyncedForms);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
        
        // Mark forms as synced
        data.forms = data.forms.map(form => ({
          ...form,
          isSynced: true
        }));
      }
      
      // Save updated sync status
      this.saveOfflineData(data);
      
      if (unsyncedTasks.length > 0 || unsyncedPhotos.length > 0 || unsyncedForms.length > 0) {
        toast.success('Sync completed', {
          description: `Synced ${unsyncedTasks.length} tasks, ${unsyncedPhotos.length} photos, and ${unsyncedForms.length} forms.`
        });
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      toast.error('Sync failed', {
        description: 'There was an error syncing your offline data. We\'ll try again later.'
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  // Clear all offline data
  public clearOfflineData(): void {
    this.resetOfflineData();
    toast.info('Offline data cleared', {
      description: 'All cached data has been removed.'
    });
  }
}

// Create a singleton instance
export const offlineManager = new OfflineManager();
