
import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MaintenanceDashboard: React.FC = () => {
  const { user, tenantId } = useTenant();

  if (user?.role !== 'maintenance_staff') {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Maintenance Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your assigned maintenance tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Equipment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Check equipment and maintenance schedules</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
