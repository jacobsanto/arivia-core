
import React from "react";
import { useRoles } from "@/hooks/useRoles";
import { usePermissions } from "@/hooks/usePermissions";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminRoles = () => {
  const { roles, createRole } = useRoles();
  const { allPermissions } = usePermissions();
  const { getPermissionsForRole, togglePermissionForRole } = useRolePermissions();

  const handleCreateRole = async (name: string) => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      await createRole(name);
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Role & Permission Management</h1>

      {roles.map((role) => (
        <Card key={role.id}>
          <CardHeader>
            <CardTitle>{role.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {allPermissions.map((perm) => {
                const assigned = getPermissionsForRole(role.id).includes(perm.key);
                return (
                  <div key={perm.key} className="flex items-center gap-2">
                    <Checkbox
                      checked={assigned}
                      onCheckedChange={() => togglePermissionForRole(role.id, perm.key)}
                    />
                    <span>{perm.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={() => {
        const name = prompt("Role name:");
        if (name) handleCreateRole(name);
      }}>
        Add Role
      </Button>
    </div>
  );
};

export default AdminRoles;
