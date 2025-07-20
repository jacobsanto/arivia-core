
import React from 'react';
import { useDevMode } from '@/contexts/DevModeContext';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export const DevModeStatusBar: React.FC = () => {
  const { isDevMode, connectionStatus, currentMockUser } = useDevMode();

  if (!isDevMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-orange-100 border-b border-orange-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-300">
            🔧 Development Mode
          </Badge>
          
          <div className="flex items-center gap-2">
            {connectionStatus.isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm text-orange-700">
              Supabase: {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {currentMockUser && (
          <Badge variant="secondary" className="bg-blue-50 text-blue-800 border-blue-300">
            Mock User: {currentMockUser.name} ({currentMockUser.role})
          </Badge>
        )}
      </div>
    </div>
  );
};
