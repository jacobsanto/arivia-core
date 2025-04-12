
import React from 'react';
import { ActivityMonitor } from './ActivityMonitor';
import { SystemMonitor } from './SystemMonitor';
import { useIsMobile } from '@/hooks/use-mobile';

interface MonitoringDashboardProps {
  compact?: boolean;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ 
  compact = false 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid gap-6 ${isMobile || compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      <ActivityMonitor limit={compact ? 3 : 5} />
      <SystemMonitor />
    </div>
  );
};
