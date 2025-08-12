import React from 'react';
import { useDevMode } from '@/contexts/DevModeContext';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { isLovablePreviewEnv } from '@/lib/env/runtimeFlags';
export const DevModeStatusBar: React.FC = () => {
  const {
    isDevMode,
    connectionStatus,
    currentMockUser
  } = useDevMode();
  if (isLovablePreviewEnv() || !isDevMode) return null;
  return <div className="fixed top-0 left-0 right-0 z-50 bg-orange-100 border-b border-orange-200 px-4 py-[5px]">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-300 text-xs py-0">
            🔧 Dev Mode
          </Badge>
          
          <div className="flex items-center gap-1">
            {connectionStatus.isConnected ? <Wifi className="h-3 w-3 text-green-600" /> : <WifiOff className="h-3 w-3 text-red-600" />}
            <span className="text-xs text-orange-700">
              {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {currentMockUser && <Badge variant="secondary" className="bg-blue-50 text-blue-800 border-blue-300 text-xs py-0">
            Mock: {currentMockUser.name} ({currentMockUser.role})
          </Badge>}
      </div>
    </div>;
};