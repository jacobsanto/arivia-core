
import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CleanerDashboard: React.FC = () => {
  const { user, tenantId } = useTenant();

  if (user?.role !== 'housekeeping_staff') {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cleaner Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your assigned cleaning tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Check your upcoming schedule</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CleanerDashboard;
