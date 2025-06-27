
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Role } from '@/types/role-permission';
import { useRoles } from '@/hooks/useRoles';
import { Trash2, Edit, Plus, Shield } from 'lucide-react';

interface RoleListProps {
  onEditRole: (role: Role) => void;
  onCreateRole: () => void;
}

export const RoleList: React.FC<RoleListProps> = ({ onEditRole, onCreateRole }) => {
  const { roles, isLoading, deleteRole } = useRoles();
  const [deletingRole, setDeletingRole] = useState<string | null>(null);

  const handleDeleteRole = async (roleId: string) => {
    setDeletingRole(roleId);
    try {
      await deleteRole(roleId);
    } finally {
      setDeletingRole(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Roles Management
          </h2>
          <p className="text-muted-foreground">Manage system roles and their permissions</p>
        </div>
        <Button onClick={onCreateRole} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-4">
        {roles.map(role => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {role.name}
                    {role.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditRole(role)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingRole === role.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteRole(role.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Created: {new Date(role.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}

        {roles.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No roles found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first role.</p>
              <Button onClick={onCreateRole}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
