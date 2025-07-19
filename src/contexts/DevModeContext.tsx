
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';

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
  autoRefreshInterval: 30000
};

const defaultConnectionStatus: ConnectionStatus = {
  isConnected: false,
  latency: 0,
  lastChecked: new Date()
};

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [settings, setSettings] = useState<DevModeSettings>(defaultSettings);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(defaultConnectionStatus);
  const [currentMockUser, setCurrentMockUser] = useState<User | null>(null);

  // Load dev mode state from localStorage
  useEffect(() => {
    const storedDevMode = localStorage.getItem('arivia-dev-mode');
    const storedSettings = localStorage.getItem('arivia-dev-settings');
    
    if (storedDevMode === 'true') {
      setIsDevMode(true);
    }
    
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.warn('Failed to parse dev mode settings:', error);
      }
    }
  }, []);

  // Persist dev mode state
  useEffect(() => {
    localStorage.setItem('arivia-dev-mode', isDevMode.toString());
  }, [isDevMode]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('arivia-dev-settings', JSON.stringify(settings));
  }, [settings]);

  // Auto connection check
  useEffect(() => {
    if (!isDevMode || !settings.showConnectionStatus) return;

    const interval = setInterval(checkConnection, settings.autoRefreshInterval);
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, [isDevMode, settings.showConnectionStatus, settings.autoRefreshInterval]);

  const toggleDevMode = () => {
    setIsDevMode(prev => !prev);
  };

  const updateSettings = (newSettings: Partial<DevModeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const checkConnection = async (): Promise<void> => {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      const latency = Date.now() - startTime;
      
      setConnectionStatus({
        isConnected: !error,
        latency,
        lastChecked: new Date(),
        error: error?.message
      });
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        latency: Date.now() - startTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown connection error'
      });
    }
  };

  const setMockUser = (user: User | null) => {
    setCurrentMockUser(user);
    if (user) {
      localStorage.setItem('arivia-mock-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('arivia-mock-user');
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setCurrentMockUser(null);
    localStorage.removeItem('arivia-mock-user');
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
