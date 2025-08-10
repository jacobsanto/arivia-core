
// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';
import { logger } from '@/services/logger';

interface DevModeSettings {
  bypassAuth: boolean;
  showConnectionStatus: boolean;
  showPerformanceMetrics: boolean;
  enableMockUsers: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  autoRefreshInterval: number;
}

interface ConnectionStatus {
  isConnected: boolean;
  latency: number;
  lastChecked: Date;
  error?: string;
  isChecking?: boolean;
}

interface DevModeContextType {
  isDevMode: boolean;
  settings: DevModeSettings;
  connectionStatus: ConnectionStatus;
  currentMockUser: User | null;
  toggleDevMode: () => void;
  updateSettings: (settings: Partial<DevModeSettings>) => void;
  checkConnection: () => Promise<void>;
  setMockUser: (user: User | null) => void;
  resetSettings: () => void;
}

const defaultSettings: DevModeSettings = {
  bypassAuth: true,
  showConnectionStatus: true,
  showPerformanceMetrics: false,
  enableMockUsers: true,
  logLevel: 'info',
  autoRefreshInterval: 300000 // Changed from 30s to 5 minutes
};

const defaultConnectionStatus: ConnectionStatus = {
  isConnected: false,
  latency: 0,
  lastChecked: new Date(),
  isChecking: false
};

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [settings, setSettings] = useState<DevModeSettings>(defaultSettings);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(defaultConnectionStatus);
  const [currentMockUser, setCurrentMockUser] = useState<User | null>(null);

  // Load dev mode state from localStorage
  useEffect(() => {
    logger.debug('DevModeProvider', 'Loading dev mode state from localStorage');
    
    const storedDevMode = localStorage.getItem('arivia-dev-mode');
    const storedSettings = localStorage.getItem('arivia-dev-settings');
    const storedMockUser = localStorage.getItem('arivia-mock-user');
    
    if (storedDevMode === 'true') {
      logger.debug('DevModeProvider', 'Enabling dev mode from localStorage');
      setIsDevMode(true);
    }
    
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
        logger.debug('DevModeProvider', 'Loaded settings', parsedSettings);
      } catch (error) {
        logger.warn('DevModeProvider', 'Failed to parse dev mode settings', { error });
      }
    }

    // Load mock user from localStorage
    if (storedMockUser) {
      try {
        const parsedMockUser = JSON.parse(storedMockUser);
        logger.debug('DevModeProvider', 'Loading mock user from localStorage', parsedMockUser);
        setCurrentMockUser(parsedMockUser);
      } catch (error) {
        logger.warn('DevModeProvider', 'Failed to parse mock user', { error });
      }
    }
  }, []);

  // Persist dev mode state
  useEffect(() => {
    localStorage.setItem('arivia-dev-mode', isDevMode.toString());
    logger.debug('DevModeProvider', 'Persisted dev mode state', { isDevMode });
  }, [isDevMode]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('arivia-dev-settings', JSON.stringify(settings));
    logger.debug('DevModeProvider: Persisted settings', settings);
  }, [settings]);

  // Auto connection check
  useEffect(() => {
    if (!isDevMode || !settings.showConnectionStatus) return;

    const interval = setInterval(checkConnection, settings.autoRefreshInterval);
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, [isDevMode, settings.showConnectionStatus, settings.autoRefreshInterval]);

  const toggleDevMode = () => {
    const newMode = !isDevMode;
    logger.debug('DevModeProvider', 'Toggling dev mode', { newMode });
    setIsDevMode(newMode);
    
    // Clear mock user when disabling dev mode
    if (!newMode) {
      setCurrentMockUser(null);
      localStorage.removeItem('arivia-mock-user');
      logger.debug('DevModeProvider', 'Cleared mock user on dev mode disable');
    }
  };

  const updateSettings = (newSettings: Partial<DevModeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    logger.debug('DevModeProvider', 'Updated settings', newSettings);
  };

  const checkConnection = async (): Promise<void> => {
    logger.debug('DevModeProvider', 'Starting connection test');
    
    setConnectionStatus(prev => ({
      ...prev,
      isChecking: true,
      error: undefined
    }));

    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      const latency = Date.now() - startTime;
      
      const newStatus = {
        isConnected: !error,
        latency,
        lastChecked: new Date(),
        error: error?.message,
        isChecking: false
      };
      
      logger.debug('DevModeProvider', 'Connection test result', newStatus);
      setConnectionStatus(newStatus);
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      
      const newStatus = {
        isConnected: false,
        latency,
        lastChecked: new Date(),
        error: errorMessage,
        isChecking: false
      };
      
      logger.error('DevModeProvider', 'Connection test failed', newStatus);
      setConnectionStatus(newStatus);
    }
  };

  const setMockUser = (user: User | null) => {
    logger.debug('DevModeProvider', 'Setting mock user', { user: user ? `${user.name} (${user.role})` : 'null' });
    setCurrentMockUser(user);
    
    if (user) {
      localStorage.setItem('arivia-mock-user', JSON.stringify(user));
      logger.debug('DevModeProvider', 'Persisted mock user to localStorage');
    } else {
      localStorage.removeItem('arivia-mock-user');
      logger.debug('DevModeProvider', 'Removed mock user from localStorage');
    }

    // Trigger a custom event to notify other components immediately
    logger.debug('DevModeProvider', 'Dispatching mockUserChanged event');
    window.dispatchEvent(new CustomEvent('mockUserChanged', { detail: user }));
    
    // Force a state update event for React components
    setTimeout(() => {
      logger.debug('DevModeProvider', 'Dispatching delayed mockUserStateUpdate event');
      window.dispatchEvent(new CustomEvent('mockUserStateUpdate', { detail: user }));
    }, 0);
  };

  const resetSettings = () => {
    logger.debug('DevModeProvider', 'Resetting dev settings to defaults');
    setSettings(defaultSettings);
    setCurrentMockUser(null);
    localStorage.removeItem('arivia-mock-user');
    localStorage.removeItem('arivia-dev-settings');
  };

  const value = {
    isDevMode,
    settings,
    connectionStatus,
    currentMockUser,
    toggleDevMode,
    updateSettings,
    checkConnection,
    setMockUser,
    resetSettings
  };

  return (
    <DevModeContext.Provider value={value}>
      {children}
    </DevModeContext.Provider>
  );
};

export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (context === undefined) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
};
