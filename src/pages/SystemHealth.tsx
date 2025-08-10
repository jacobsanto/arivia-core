import React from 'react';
import { SystemHealthDashboard } from '@/components/system/SystemHealthDashboard';
import { SystemHealthErrorBoundary } from '@/components/error-boundaries/SystemHealthErrorBoundary';

export default function SystemHealth() {
  return (
    <SystemHealthErrorBoundary>
      <SystemHealthDashboard />
    </SystemHealthErrorBoundary>
  );
}