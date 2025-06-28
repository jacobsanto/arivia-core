
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Permission } from '@/types/role-permission';
import { usePermissions } from '@/hooks/usePermissions';
import { Trash2, Edit, Plus, Key } from 'lucide-react';

interface PermissionListProps {
  onEditPermission: (permission: Permission) => void;
  onCreatePermission: () => void;
}

export const PermissionList: React.FC<PermissionListProps> = ({ 
  onEditPermission, 
  onCreatePermission 
}) => {
  const { permissions, permissionsByCategory, isLoading, deletePermission } = usePermissions();
  const [deletingPermission, setDeletingPermission] = useState<string | null>(null);

  const handleDeletePermission = async (permissionId: string) => {
    setDeletingPermission(permissionId);
    try {
      await deletePermission(permissionId);
    } finally {
      setDeletingPermission(null);
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
            <Key className="h-6 w-6" />
            Permissions Management
          </h2>
          <p className="text-muted-foreground">Manage system permissions and access levels</p>
        </div>
        <Button onClick={onCreatePermission} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Permission
        </Button>
      </div>

      {Object.keys(permissionsByCategory).length > 0 ? (
        Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category} Permissions</CardTitle>
              <CardDescription>
                {categoryPermissions.length} permission{categoryPermissions.length !== 1 ? 's' : ''} in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {categoryPermissions.map(permission => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{permission.label}</h3>
                        <Badge 
                          variant={permission.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {permission.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Key: <code className="bg-muted px-1 rounded">{permission.key}</code>
                      </p>
                      {permission.description && (
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditPermission(permission)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingPermission === permission.id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the permission "{permission.label}"? This action cannot be undone and may affect users who have this permission.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePermission(permission.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No permissions found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first permission.</p>
            <Button onClick={onCreatePermission}>
              <Plus className="h-4 w-4 mr-2" />
              Create Permission
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
