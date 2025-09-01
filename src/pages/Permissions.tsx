import React from 'react';
import { Helmet } from 'react-helmet-async';
import { usePermissions } from '@/hooks/usePermissionsAdmin';
import PermissionsPageHeader from '@/components/permissions/PermissionsPageHeader';
import PermissionMatrixTable from '@/components/permissions/PermissionMatrixTable';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Permissions: React.FC = () => {
  const {
    permissionMatrix,
    loading,
    saving,
    error,
    hasChanges,
    getPermissionsByCategory,
    togglePermission,
    savePermissions,
    resetPermissions
  } = usePermissions();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Helmet>
          <title>Permissions - Arivia Villa Sync</title>
        </Helmet>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Loading Permissions</h3>
              <p className="text-muted-foreground">Setting up the permission matrix...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Helmet>
          <title>Permissions - Arivia Villa Sync</title>
        </Helmet>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load permissions: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const categories = getPermissionsByCategory();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Helmet>
        <title>Permissions - Arivia Villa Sync</title>
        <meta name="description" content="Manage role-based access control and permissions for all system users" />
      </Helmet>

      {/* Page Header */}
      <PermissionsPageHeader
        hasChanges={hasChanges}
        saving={saving}
        onSave={savePermissions}
        onReset={resetPermissions}
      />

      {/* Permissions Matrix */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Role Permission Matrix</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Grant or revoke permissions for each user role. Super Admin permissions are locked for security.
              </p>
            </div>
            
            <PermissionMatrixTable
              categories={categories}
              permissionMatrix={permissionMatrix}
              onTogglePermission={togglePermission}
            />
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