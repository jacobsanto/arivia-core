import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Permissions: React.FC = () => {
  const { user } = useUser();

  // Check if user has admin access
  const hasAdminAccess = user?.role === "superadmin" || user?.role === "administrator";

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto p-6">
        <Helmet>
          <title>Permissions - Arivia Villa Sync</title>
        </Helmet>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You must be an Administrator or Super Admin to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Helmet>
        <title>Permissions - Arivia Villa Sync</title>
        <meta name="description" content="Manage role-based access control and permissions for all system users" />
      </Helmet>

      {/* Permissions Info */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Permission System</h3>
              <p className="text-sm text-muted-foreground mb-6">
                The permissions system is currently configured for development mode. Full database-driven permissions will be available when authentication is fully implemented.
              </p>
            </div>
            
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Current User Access</h4>
              <p className="text-sm text-muted-foreground">
                Role: <span className="font-medium">{user?.role}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Access Level: <span className="font-medium">Full Administrative Access</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Permission Guidelines</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Role Hierarchy</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Super Admin:</strong> Unrestricted system access</li>
                <li>• <strong>Administrator:</strong> Full access except system admin</li>
                <li>• <strong>Property Manager:</strong> Property and operations management</li>
                <li>• <strong>Staff:</strong> Task execution and basic operations</li>
                <li>• <strong>Guest:</strong> Limited read-only access</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review permissions regularly</li>
                <li>• Follow principle of least privilege</li>
                <li>• Test changes with test users</li>
                <li>• Document role responsibilities</li>
                <li>• Monitor permission usage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;