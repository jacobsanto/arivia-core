import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MonitoringCenter from '@/components/monitoring/MonitoringCenter';
import OptimizationSummary from '@/components/optimization/OptimizationSummary';
import SystemHealthDashboard from '@/components/monitoring/SystemHealthDashboard';
import EgressValidation from '@/components/monitoring/EgressValidation';

const MonitoringRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MonitoringCenter />} />
      <Route path="/optimization-summary" element={<OptimizationSummary />} />
      <Route path="/system-health" element={<SystemHealthDashboard />} />
      <Route path="/egress-validation" element={<EgressValidation />} />
      <Route path="*" element={<Navigate to="/monitoring" replace />} />
    </Routes>
  );
};

export default MonitoringRoutes;