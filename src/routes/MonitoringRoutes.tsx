import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MonitoringCenter from '@/components/monitoring/MonitoringCenter';

const MonitoringRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MonitoringCenter />} />
      <Route path="*" element={<Navigate to="/monitoring" replace />} />
    </Routes>
  );
};

export default MonitoringRoutes;