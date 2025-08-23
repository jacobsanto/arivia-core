/**
 * Centralized application state management
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';
import { logger } from '@/services/logger';

export interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // UI state
  isMobileMenuOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Application state
  isOnline: boolean;
  lastSync: Date | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setOnlineStatus: (online: boolean) => void;
  updateLastSync: () => void;
  clearState: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isMobileMenuOpen: false,
  sidebarCollapsed: false,
  theme: 'system' as const,
  isOnline: true,
  lastSync: null
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => {
        logger.debug('AppState: Setting user', { userId: user?.id, role: user?.role });
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },
      
      setMobileMenuOpen: (open) => {
        logger.debug('AppState: Setting mobile menu', { open });
        set({ isMobileMenuOpen: open });
      },
      
      setSidebarCollapsed: (collapsed) => {
        logger.debug('AppState: Setting sidebar collapsed', { collapsed });
        set({ sidebarCollapsed: collapsed });
      },
      
      setTheme: (theme) => {
        logger.debug('AppState: Setting theme', { theme });
        set({ theme });
      },
      
      setOnlineStatus: (online) => {
        const wasOffline = !get().isOnline;
        logger.debug('AppState: Setting online status', { online, wasOffline });
        set({ isOnline: online });
        
        // If coming back online, trigger sync
        if (online && wasOffline) {
          set({ lastSync: new Date() });
        }
      },
      
      updateLastSync: () => {
        logger.debug('AppState: Updating last sync');
        set({ lastSync: new Date() });
      },
      
      clearState: () => {
        logger.debug('AppState: Clearing state');
        set(initialState);
      }
    }),
    {
      name: 'arivia-app-state',
      partialize: (state) => ({
        // Only persist certain parts of the state
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        lastSync: state.lastSync
      })
    }
  )
);

// Selectors for optimized re-renders
export const useUser = () => useAppStore(state => state.user);
export const useIsAuthenticated = () => useAppStore(state => state.isAuthenticated);
export const useMobileMenu = () => useAppStore(state => ({
  isOpen: state.isMobileMenuOpen,
  setOpen: state.setMobileMenuOpen
}));
export const useSidebar = () => useAppStore(state => ({
  collapsed: state.sidebarCollapsed,
  setCollapsed: state.setSidebarCollapsed
}));
export const useTheme = () => useAppStore(state => ({
  theme: state.theme,
  setTheme: state.setTheme
}));
export const useConnectionStatus = () => useAppStore(state => ({
  isOnline: state.isOnline,
  lastSync: state.lastSync,
  setOnlineStatus: state.setOnlineStatus,
  updateLastSync: state.updateLastSync
}));