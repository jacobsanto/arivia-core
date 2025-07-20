
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
    const storedMockUser = localStorage.getItem('arivia-mock-user');
    
    if (storedDevMode === 'true') {
      setIsDevMode(true);
      console.log('🔧 Dev mode enabled from localStorage');
    }
    
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
        console.log('🔧 Dev settings loaded:', parsedSettings);
      } catch (error) {
        console.warn('Failed to parse dev mode settings:', error);
      }
    }

    // Load mock user from localStorage
    if (storedMockUser) {
      try {
        const parsedMockUser = JSON.parse(storedMockUser);
        setCurrentMockUser(parsedMockUser);
        console.log('🔧 Mock user loaded from localStorage:', parsedMockUser.name, parsedMockUser.role);
      } catch (error) {
        console.warn('Failed to parse mock user:', error);
      }
    }
  }, []);

  // Persist dev mode state
  useEffect(() => {
    localStorage.setItem('arivia-dev-mode', isDevMode.toString());
    console.log('🔧 Dev mode persisted:', isDevMode);
  }, [isDevMode]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('arivia-dev-settings', JSON.stringify(settings));
    console.log('🔧 Dev settings persisted:', settings);
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
    setIsDevMode(newMode);
    console.log('🔧 Dev mode toggled:', newMode);
    
    // Clear mock user when disabling dev mode
    if (!newMode) {
      setCurrentMockUser(null);
      localStorage.removeItem('arivia-mock-user');
      console.log('🔧 Mock user cleared on dev mode disable');
    }
  };

  const updateSettings = (newSettings: Partial<DevModeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    console.log('🔧 Dev settings updated:', newSettings);
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
    console.log('🔧 Setting mock user:', user ? `${user.name} (${user.role})` : 'null');
    setCurrentMockUser(user);
    
    if (user) {
      localStorage.setItem('arivia-mock-user', JSON.stringify(user));
      console.log('🔧 Mock user persisted to localStorage');
    } else {
      localStorage.removeItem('arivia-mock-user');
      console.log('🔧 Mock user removed from localStorage');
    }

    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('mockUserChanged', { detail: user }));
  };

  const resetSettings = () => {
    console.log('🔧 Resetting dev settings to defaults');
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
