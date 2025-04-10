
/**
 * Utility for managing offline data and sync operations
 */
import { toast } from "sonner";
import { OfflineDataSummary } from "@/types/offline";

type SyncableData = {
  id: string;
  timestamp: number;
  entityType: string;
  action: 'create' | 'update' | 'delete';
  data: any;
};

class OfflineManager {
  private STORAGE_KEY = 'arivia_offline_data';
  
  /**
   * Check if there is unsynchronized data
   */
  public hasUnsyncedData(): boolean {
    const offlineData = this.getOfflineData();
    return offlineData.length > 0;
  }
  
  /**
   * Get all stored offline data
   */
  public getOfflineData(): SyncableData[] {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Error reading offline data:', error);
      return [];
    }
  }
  
  /**
   * Store data for offline use
   */
  public storeOfflineData(entityType: string, action: 'create' | 'update' | 'delete', data: any): void {
    try {
      const offlineData = this.getOfflineData();
      
      // Create a new data entry
      const newEntry: SyncableData = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        entityType,
        action,
        data
      };
      
      // Add to storage
      offlineData.push(newEntry);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offlineData));
      
      // Show toast notification
      toast.success('Saved offline', {
        description: 'Changes will sync when you reconnect.'
      });
    } catch (error) {
      console.error('Error storing offline data:', error);
      toast.error('Failed to save offline', {
        description: 'Please try again.'
      });
    }
  }
  
  /**
   * Sync offline data when online
   */
  public async syncOfflineData(): Promise<boolean> {
    const offlineData = this.getOfflineData();
    
    if (offlineData.length === 0) {
      return true; // Nothing to sync
    }
    
    // Show toast that sync started
    toast('Syncing data...', {
      duration: 2000
    });
    
    try {
      // In a real app, this would be an API call to sync data
      // For now, we'll simulate success after a delay
      console.log('Syncing offline data:', offlineData);
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      // Clear synced data
      localStorage.removeItem(this.STORAGE_KEY);
      
      // Show success toast
      toast.success('Data synchronized successfully', {
        description: `${offlineData.length} items synchronized`
      });
      
      return true;
    } catch (error) {
      console.error('Error syncing offline data:', error);
      toast.error('Sync failed', {
        description: 'Please try again later.'
      });
      return false;
    }
  }
  
  /**
   * Get data counts by type
   */
  public getOfflineDataSummary(): OfflineDataSummary {
    const offlineData = this.getOfflineData();
    
    // Ensure offlineData is an array before calling reduce
    const summary = Array.isArray(offlineData) ? offlineData.reduce((acc: Record<string, number>, item) => {
      acc[item.entityType] = (acc[item.entityType] || 0) + 1;
      return acc;
    }, {}) : {};
    
    return {
      total: Array.isArray(offlineData) ? offlineData.length : 0,
      summary
    };
  }
}

export const offlineManager = new OfflineManager();
