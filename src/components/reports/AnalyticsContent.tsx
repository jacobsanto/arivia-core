
import React from 'react';
import { AnalyticsTabs } from './analytics/AnalyticsTabs';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';

export const AnalyticsContent: React.FC = () => {
  return (
    <AnalyticsProvider>
      <AnalyticsTabs />
    </AnalyticsProvider>
  );
};
