
export interface IntegrationHealthData {
  status?: string;
  last_synced?: string;
  last_error?: string;
  provider: string;
  updated_at?: string;
}

export interface GuestyStatusBadgeProps {
  status?: string;
}

export interface GuestySyncControlsProps {
  onTest: () => void;
  onSync: () => void;
  isTesting: boolean;
  isSyncing: boolean;
  isConnected: boolean;
}
