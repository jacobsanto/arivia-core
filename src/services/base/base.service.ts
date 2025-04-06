
import { offlineManager } from "@/utils/offlineManager";

/**
 * Base Service
 * 
 * This abstract class provides a foundation for all data services to extend from,
 * with built-in support for online/offline mode, caching, and error handling.
 */
export abstract class BaseService<T> {
  protected entityName: string;

  constructor(entityName: string) {
    this.entityName = entityName;
  }

  /**
   * Check if the app is currently online
   */
  protected isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get all entities of this type
   */
  async getAll(): Promise<T[]> {
    try {
      if (!this.isOnline()) {
        console.log(`[${this.entityName}] Using offline data`);
        return this.getOfflineData();
      }
      
      // In a real implementation, this would make an API call
      // For now, we're just using the offline data
      return this.getOfflineData();
    } catch (error) {
      console.error(`[${this.entityName}] Error getting all:`, error);
      throw error;
    }
  }

  /**
   * Get a single entity by ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      const items = await this.getAll();
      // @ts-ignore - We assume all entities have an id property
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`[${this.entityName}] Error getting by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new entity
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      // Generate a unique ID for the new entity
      const newItem = {
        ...data,
        id: `${this.entityName}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      } as T;
      
      // Save to offline storage
      await this.saveOfflineData(newItem);
      
      // If online, would make an API call here
      
      return newItem;
    } catch (error) {
      console.error(`[${this.entityName}] Error creating:`, error);
      throw error;
    }
  }

  /**
   * Update an entity
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const items = await this.getAll();
      
      // @ts-ignore - We assume all entities have an id property
      const itemIndex = items.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        throw new Error(`${this.entityName} with ID ${id} not found`);
      }
      
      // Update the item
      const updatedItem = {
        ...items[itemIndex],
        ...data,
      } as T;
      
      // Update the items array
      items[itemIndex] = updatedItem;
      
      // Save to offline storage
      await this.saveOfflineItems(items);
      
      // If online, would make an API call here
      
      return updatedItem;
    } catch (error) {
      console.error(`[${this.entityName}] Error updating ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an entity
   */
  async delete(id: string): Promise<void> {
    try {
      const items = await this.getAll();
      
      // Filter out the item with the given ID
      // @ts-ignore - We assume all entities have an id property
      const filteredItems = items.filter(item => item.id !== id);
      
      // Save to offline storage
      await this.saveOfflineItems(filteredItems);
      
      // If online, would make an API call here
    } catch (error) {
      console.error(`[${this.entityName}] Error deleting ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get data from offline storage
   */
  protected getOfflineData(): T[] {
    const storageKey = `arivia_${this.entityName}`;
    const storedData = localStorage.getItem(storageKey);
    return storedData ? JSON.parse(storedData) : [];
  }

  /**
   * Save a single item to offline storage
   */
  protected async saveOfflineData(item: T): Promise<void> {
    const items = await this.getAll();
    
    // @ts-ignore - We assume all entities have an id property
    const itemIndex = items.findIndex(existingItem => existingItem.id === item.id);
    
    if (itemIndex === -1) {
      items.push(item);
    } else {
      items[itemIndex] = item;
    }
    
    await this.saveOfflineItems(items);
  }

  /**
   * Save an array of items to offline storage
   */
  protected async saveOfflineItems(items: T[]): Promise<void> {
    const storageKey = `arivia_${this.entityName}`;
    localStorage.setItem(storageKey, JSON.stringify(items));
    
    // Trigger a sync if we're online
    if (this.isOnline()) {
      offlineManager.syncOfflineData();
    }
  }
}
