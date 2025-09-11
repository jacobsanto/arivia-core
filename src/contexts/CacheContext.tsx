import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { logger } from '@/services/logger';
import { supabase } from '@/integrations/supabase/client';

// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
  key: string;
  version: string;
}

// Cache state interface
interface CacheState {
  entries: Map<string, CacheEntry>;
  isOnline: boolean;
  syncQueue: QueueItem[];
  lastSync: number;
}

// Queue item for offline operations
interface QueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

// Cache actions
type CacheAction =
  | { type: 'SET_ENTRY'; key: string; data: any; ttl: number }
  | { type: 'REMOVE_ENTRY'; key: string }
  | { type: 'CLEAR_EXPIRED' }
  | { type: 'SET_ONLINE'; isOnline: boolean }
  | { type: 'ADD_TO_QUEUE'; item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'> }
  | { type: 'REMOVE_FROM_QUEUE'; id: string }
  | { type: 'UPDATE_SYNC_TIME' }
  | { type: 'CLEAR_CACHE' };

// Cache reducer
const cacheReducer = (state: CacheState, action: CacheAction): CacheState => {
  switch (action.type) {
    case 'SET_ENTRY': {
      const newEntries = new Map(state.entries);
      newEntries.set(action.key, {
        data: action.data,
        timestamp: Date.now(),
        ttl: action.ttl,
        key: action.key,
        version: '1.0',
      });
      return { ...state, entries: newEntries };
    }
    
    case 'REMOVE_ENTRY': {
      const newEntries = new Map(state.entries);
      newEntries.delete(action.key);
      return { ...state, entries: newEntries };
    }
    
    case 'CLEAR_EXPIRED': {
      const now = Date.now();
      const newEntries = new Map();
      
      state.entries.forEach((entry, key) => {
        if (now - entry.timestamp < entry.ttl) {
          newEntries.set(key, entry);
        }
      });
      
      return { ...state, entries: newEntries };
    }
    
    case 'SET_ONLINE':
      return { ...state, isOnline: action.isOnline };
    
    case 'ADD_TO_QUEUE': {
      const queueItem: QueueItem = {
        ...action.item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        retryCount: 0,
      };
      
      return {
        ...state,
        syncQueue: [...state.syncQueue, queueItem],
      };
    }
    
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        syncQueue: state.syncQueue.filter(item => item.id !== action.id),
      };
    
    case 'UPDATE_SYNC_TIME':
      return { ...state, lastSync: Date.now() };
    
    case 'CLEAR_CACHE':
      return {
        ...state,
        entries: new Map(),
        syncQueue: [],
      };
    
    default:
      return state;
  }
};

// Context interface
interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: (key: string, data: any, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  isOnline: boolean;
  queueOfflineOperation: (operation: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>) => void;
  syncQueue: QueueItem[];
  getCacheStats: () => { size: number; queueSize: number; lastSync: number };
  invalidatePattern: (pattern: string) => void;
}

// Create context
const CacheContext = createContext<CacheContextType | null>(null);

// Cache provider component
export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cacheReducer, {
    entries: new Map(),
    isOnline: navigator.onLine,
    syncQueue: [],
    lastSync: 0,
  });

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE', isOnline: true });
      logger.info('Connection restored, starting sync');
      processSyncQueue();
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE', isOnline: false });
      logger.warn('Connection lost, enabling offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clean up expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CLEAR_EXPIRED' });
    }, 60000); // Clean every minute

    return () => clearInterval(interval);
  }, []);

  // Process sync queue when online
  const processSyncQueue = async () => {
    if (!state.isOnline || state.syncQueue.length === 0) return;

    logger.info('Processing sync queue', { queueSize: state.syncQueue.length });

    for (const item of state.syncQueue) {
      try {
        await executeQueueItem(item);
        dispatch({ type: 'REMOVE_FROM_QUEUE', id: item.id });
        logger.debug('Sync queue item processed', { itemId: item.id });
      } catch (error) {
        logger.error('Failed to process sync queue item', error, { item });
        
        if (item.retryCount < item.maxRetries) {
          // Retry logic would go here
          logger.info('Will retry sync queue item', { itemId: item.id, retryCount: item.retryCount });
        } else {
          // Remove failed item after max retries
          dispatch({ type: 'REMOVE_FROM_QUEUE', id: item.id });
          logger.warn('Removing failed sync queue item after max retries', { itemId: item.id });
        }
      }
    }

    dispatch({ type: 'UPDATE_SYNC_TIME' });
  };

  // Execute a queued operation
  const executeQueueItem = async (item: QueueItem) => {
    const { operation, table, data } = item;

    switch (operation) {
      case 'create':
        await (supabase as any).from(table).insert(data);
        break;
      case 'update':
        await (supabase as any).from(table).update(data).eq('id', data.id);
        break;
      case 'delete':
        await (supabase as any).from(table).delete().eq('id', data.id);
        break;
    }
  };

  // Cache operations
  const get = function<T>(key: string): T | null {
    const entry = state.entries.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      dispatch({ type: 'REMOVE_ENTRY', key });
      return null;
    }
    
    logger.debug('Cache hit', { key });
    return entry.data as T;
  };

  const set = (key: string, data: any, ttl: number = 300000) => {
    dispatch({ type: 'SET_ENTRY', key, data, ttl });
    logger.debug('Cache set', { key, ttl });
  };

  const remove = (key: string) => {
    dispatch({ type: 'REMOVE_ENTRY', key });
    logger.debug('Cache remove', { key });
  };

  const clear = () => {
    dispatch({ type: 'CLEAR_CACHE' });
    logger.info('Cache cleared');
  };

  const queueOfflineOperation = (operation: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
    dispatch({ type: 'ADD_TO_QUEUE', item: operation });
    logger.info('Operation queued for offline sync', { operation: operation.operation, table: operation.table });
  };

  const getCacheStats = () => ({
    size: state.entries.size,
    queueSize: state.syncQueue.length,
    lastSync: state.lastSync,
  });

  const invalidatePattern = (pattern: string) => {
    const regex = new RegExp(pattern);
    const keysToRemove: string[] = [];
    
    state.entries.forEach((_, key) => {
      if (regex.test(key)) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      dispatch({ type: 'REMOVE_ENTRY', key });
    });
    
    logger.debug('Cache invalidated by pattern', { pattern, keysRemoved: keysToRemove.length });
  };

  // Process sync queue when coming online
  useEffect(() => {
    if (state.isOnline && state.syncQueue.length > 0) {
      processSyncQueue();
    }
  }, [state.isOnline, state.syncQueue.length]);

  const contextValue: CacheContextType = {
    get,
    set,
    remove,
    clear,
    isOnline: state.isOnline,
    queueOfflineOperation,
    syncQueue: state.syncQueue,
    getCacheStats,
    invalidatePattern,
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
};

// Custom hook to use cache
export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};