
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";

const PermissionsDisplay: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Simple permission display based on role
  const rolePermissions: Record<string, string[]> = {
    superadmin: ['All System Permissions'],
    tenant_admin: [
      'Manage Properties', 'Manage Users', 'View All Tasks', 'Assign Tasks',
      'Manage Inventory', 'View Reports', 'View Damage Reports'
    ],
    property_manager: [
      'View Properties', 'View All Tasks', 'Assign Tasks', 'View Inventory', 'View Reports'
    ],
    housekeeping_staff: ['View Assigned Tasks', 'View Inventory'],
    maintenance_staff: ['View Assigned Tasks', 'View Inventory'],
    inventory_manager: ['Manage Inventory', 'Approve Transfers', 'View Reports'],
    concierge: ['View Assigned Tasks', 'View Properties']
  };

  const permissions = rolePermissions[user.role] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Your Permissions
        </CardTitle>
        <CardDescription>
          Based on your role: {user.role}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {permissions.map((permission, index) => (
            <Badge key={index} variant="secondary">
              {permission}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsDisplay;
