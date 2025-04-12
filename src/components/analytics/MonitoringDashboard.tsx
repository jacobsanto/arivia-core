
import React from 'react';
import { ActivityMonitor } from './ActivityMonitor';
import { SystemMonitor } from './SystemMonitor';
import { useIsMobile } from '@/hooks/use-mobile';
import { PropertyFilter } from '@/contexts/AnalyticsContext';

interface MonitoringDashboardProps {
  compact?: boolean;
  propertyFilter?: PropertyFilter;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ 
  compact = false,
  propertyFilter = 'all'
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid gap-6 ${isMobile || compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      <ActivityMonitor limit={compact ? 3 : 5} propertyFilter={propertyFilter} />
      <SystemMonitor />
    </div>
  );
};
