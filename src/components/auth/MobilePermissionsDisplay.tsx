
import React from 'react';
import { User } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Settings, Check, X } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface MobilePermissionsDisplayProps {
  user: User;
  onPermissionChange?: (permission: string, value: boolean) => void;
  editable?: boolean;
}

const MobilePermissionsDisplay: React.FC<MobilePermissionsDisplayProps> = ({
  user,
  onPermissionChange,
  editable = false
}) => {
  const { canAccess, getAllPermissionsList } = usePermissions();
  
  const allPermissions = [
    'viewDashboard', 'viewProperties', 'manageProperties', 'viewAllTasks',
    'viewAssignedTasks', 'assignTasks', 'viewInventory', 'manageInventory',
    'approveTransfers', 'viewUsers', 'manageUsers', 'viewReports', 'viewChat',
    'view_damage_reports'
  ];

  const getPermissionDisplayName = (key: string) => {
    const displayNames: Record<string, string> = {
      viewDashboard: 'View Dashboard',
      viewProperties: 'View Properties',
      manageProperties: 'Manage Properties',
      viewAllTasks: 'View All Tasks',
      viewAssignedTasks: 'View Assigned Tasks',
      assignTasks: 'Assign Tasks',
      viewInventory: 'View Inventory',
      manageInventory: 'Manage Inventory',
      approveTransfers: 'Approve Transfers',
      viewUsers: 'View Users',
      manageUsers: 'Manage Users',
      viewReports: 'View Reports',
      viewChat: 'View Chat',
      view_damage_reports: 'View Damage Reports'
    };
    return displayNames[key] || key;
  };

  const getPermissionCategory = (key: string) => {
    if (key.includes('Dashboard')) return 'dashboard';
    if (key.includes('Properties') || key.includes('Property')) return 'properties';
    if (key.includes('Tasks') || key.includes('Task')) return 'tasks';
    if (key.includes('Inventory')) return 'inventory';
    if (key.includes('Users') || key.includes('User')) return 'users';
    if (key.includes('Reports') || key.includes('Report')) return 'reports';
    if (key.includes('Chat')) return 'chat';
    return 'general';
  };

  const categorizedPermissions = allPermissions.reduce((acc, perm) => {
    const category = getPermissionCategory(perm);
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Permissions for {user.name}
          </CardTitle>
          <CardDescription>
            Current role: <Badge variant="outline">{user.role}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(categorizedPermissions).map(([category, permissions]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {category}
              </h4>
              <div className="space-y-2">
                {permissions.map((permission) => {
                  const hasPermission = canAccess(permission);
                  return (
                    <div key={permission} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-2">
                        {hasPermission ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">{getPermissionDisplayName(permission)}</span>
                      </div>
                      {editable && (
                        <Switch
                          checked={hasPermission}
                          onCheckedChange={(checked) => onPermissionChange?.(permission, checked)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobilePermissionsDisplay;
