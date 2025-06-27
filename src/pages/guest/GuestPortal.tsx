
import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GuestPortal: React.FC = () => {
  const { user, tenantId } = useTenant();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Guest Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your current and past bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Get help and contact support</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestPortal;
