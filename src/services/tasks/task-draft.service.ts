
import { supabase } from '@/integrations/supabase/client';
import { toastService } from '@/services/toast';
import { offlineManager } from '@/utils/offlineManager';

const STORAGE_KEY_PREFIX = 'task_draft_';

interface TaskDraft {
  id: string;
  title: string;
  type: string;
  dueDate?: string;
  property?: string;
  assignedTo?: string;
  description?: string;
  priority?: string;
  lastUpdated: number;
  additionalFields?: Record<string, any>;
}

export class TaskDraftService {
  private isOnline: boolean;

  constructor() {
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Save a task draft to local storage and if online, to the database
   */
  async saveDraft(taskType: string, draftData: Partial<TaskDraft>): Promise<string> {
    try {
      // Generate a draft ID if not provided
      const draftId = draftData.id || `draft_${Date.now()}`;
      
      // Create the full draft object
      const taskDraft: TaskDraft = {
        ...draftData as any, // Cast partial as required fields will be set below
        id: draftId,
        title: draftData.title || "Untitled Draft",
        type: taskType,
        lastUpdated: Date.now()
      };
      
      // Always save to local storage for quick access
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${draftId}`, JSON.stringify(taskDraft));
      
      // If online and authenticated, save to database too
      if (this.isOnline) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          // Save to user settings table
          const { error } = await supabase
            .from('user_settings')
            .upsert({
              user_id: userData.user.id,
              setting_key: `task_draft_${draftId}`,
              setting_value: taskDraft as any // Cast to any for Supabase JSON type
            }, {
              onConflict: 'user_id,setting_key'
            });
            
          if (error) throw error;
        }
      } else {
        // Store for offline sync
        offlineManager.storeOfflineData('task_drafts', 'update', {
          id: draftId, 
          data: taskDraft
        });
      }
      
      return draftId;
    } catch (error) {
      console.error('Error saving task draft:', error);
      // Don't show toast for regular autosaves to avoid annoying the user
      return '';
    }
  }

  /**
   * Load a specific draft by ID
   */
  async loadDraft(draftId: string): Promise<TaskDraft | null> {
    try {
      // First try localStorage for immediate access
      const localDraft = localStorage.getItem(`${STORAGE_KEY_PREFIX}${draftId}`);
      if (localDraft) {
        return JSON.parse(localDraft);
      }
      
      // If not in localStorage and online, try from database
      if (this.isOnline) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('setting_value')
            .eq('user_id', userData.user.id)
            .eq('setting_key', `task_draft_${draftId}`)
            .maybeSingle();
            
          if (error) throw error;
          
          if (data) {
            // Cast the JSON data to the correct type and cache in localStorage
            const draftData = data.setting_value as unknown as TaskDraft;
            localStorage.setItem(`${STORAGE_KEY_PREFIX}${draftId}`, JSON.stringify(draftData));
            return draftData;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error loading task draft:', error);
      return null;
    }
  }

  /**
   * Get all saved drafts
   */
  async getAllDrafts(taskType?: string): Promise<TaskDraft[]> {
    try {
      const drafts: TaskDraft[] = [];
      
      // Get drafts from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          try {
            const draft = JSON.parse(localStorage.getItem(key) || '{}') as TaskDraft;
            if (!taskType || draft.type === taskType) {
              drafts.push(draft);
            }
          } catch (e) {
            console.error('Error parsing draft:', e);
          }
        }
      }
      
      // If online, also fetch from database
      if (this.isOnline) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('setting_key, setting_value')
            .eq('user_id', userData.user.id)
            .like('setting_key', 'task_draft_%');
            
          if (error) throw error;
          
          if (data) {
            // Add database drafts not already in local storage
            data.forEach(item => {
              const draftId = item.setting_key.replace('task_draft_', '');
              const draftData = item.setting_value as unknown as TaskDraft;
              
              const existingIndex = drafts.findIndex(d => d.id === draftData.id);
              if (existingIndex === -1) {
                if (!taskType || draftData.type === taskType) {
                  drafts.push(draftData);
                }
              }
            });
          }
        }
      }
      
      // Sort by last updated
      return drafts.sort((a, b) => b.lastUpdated - a.lastUpdated);
    } catch (error) {
      console.error('Error getting all drafts:', error);
      return [];
    }
  }

  /**
   * Delete a draft by ID
   */
  async deleteDraft(draftId: string): Promise<boolean> {
    try {
      // Remove from localStorage
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${draftId}`);
      
      // If online, remove from database too
      if (this.isOnline) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { error } = await supabase
            .from('user_settings')
            .delete()
            .eq('user_id', userData.user.id)
            .eq('setting_key', `task_draft_${draftId}`);
            
          if (error) throw error;
        }
      } else {
        // Store delete operation for offline sync
        offlineManager.storeOfflineData('task_drafts', 'delete', { id: draftId });
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting task draft:', error);
      toastService.error('Failed to delete draft');
      return false;
    }
  }
}

export const taskDraftService = new TaskDraftService();
