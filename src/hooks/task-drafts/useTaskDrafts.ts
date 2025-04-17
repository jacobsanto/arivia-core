
import { useState, useEffect, useCallback } from 'react';
import { taskDraftService } from '@/services/tasks/task-draft.service';
import { toastService } from '@/services/toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { debounce } from 'lodash';

export interface UseTaskDraftsOptions {
  taskType: string;
  autosaveInterval?: number;
  notifyOnAutosave?: boolean;
}

export function useTaskDrafts(options: UseTaskDraftsOptions) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
  // Load all drafts on mount
  useEffect(() => {
    const loadDrafts = async () => {
      setIsLoading(true);
      try {
        const allDrafts = await taskDraftService.getAllDrafts(options.taskType);
        setDrafts(allDrafts);
      } catch (error) {
        console.error('Error loading drafts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDrafts();
  }, [options.taskType]);
  
  // Create debounced autosave function
  const autosaveDraft = useCallback(
    debounce(async (draftData: any) => {
      try {
        const draftId = await taskDraftService.saveDraft(
          options.taskType,
          draftData
        );
        
        if (draftId && !currentDraftId) {
          setCurrentDraftId(draftId);
        }
        
        if (options.notifyOnAutosave) {
          toastService.success('Draft saved', {
            description: isMobile ? undefined : 'Your progress has been saved automatically',
          });
        }
        
        // Update drafts list
        const allDrafts = await taskDraftService.getAllDrafts(options.taskType);
        setDrafts(allDrafts);
        
        return draftId;
      } catch (error) {
        console.error('Error in autosave:', error);
        return null;
      }
    }, options.autosaveInterval || 3000),
    [options.taskType, options.notifyOnAutosave, currentDraftId, isMobile]
  );
  
  // Save draft explicitly (not debounced)
  const saveDraft = async (draftData: any) => {
    try {
      autosaveDraft.cancel();
      
      const draftId = await taskDraftService.saveDraft(
        options.taskType,
        {
          ...draftData,
          id: currentDraftId || undefined
        }
      );
      
      if (draftId) {
        setCurrentDraftId(draftId);
        toastService.success('Draft saved', {
          description: 'Your progress has been saved'
        });
        
        // Update drafts list
        const allDrafts = await taskDraftService.getAllDrafts(options.taskType);
        setDrafts(allDrafts);
      }
      
      return draftId;
    } catch (error) {
      console.error('Error saving draft:', error);
      toastService.error('Failed to save draft');
      return null;
    }
  };
  
  // Load a specific draft
  const loadDraft = async (draftId: string) => {
    try {
      setIsLoading(true);
      const draft = await taskDraftService.loadDraft(draftId);
      setCurrentDraftId(draftId);
      return draft;
    } catch (error) {
      console.error('Error loading draft:', error);
      toastService.error('Failed to load draft');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a draft
  const deleteDraft = async (draftId: string) => {
    try {
      const success = await taskDraftService.deleteDraft(draftId);
      
      if (success) {
        if (draftId === currentDraftId) {
          setCurrentDraftId(null);
        }
        
        // Update drafts list
        const allDrafts = await taskDraftService.getAllDrafts(options.taskType);
        setDrafts(allDrafts);
        
        toastService.success('Draft deleted');
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  };
  
  return {
    drafts,
    currentDraftId,
    isLoading,
    autosaveDraft,
    saveDraft,
    loadDraft,
    deleteDraft
  };
}
