
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Permission } from '@/types/role-permission';
import { usePermissions } from '@/hooks/usePermissions';
import { Trash2, Edit, Plus, Search, Key } from 'lucide-react';

interface PermissionListProps {
  onEditPermission: (permission: Permission) => void;
  onCreatePermission: () => void;
}

export const PermissionList: React.FC<PermissionListProps> = ({ onEditPermission, onCreatePermission }) => {
  const { permissionsByCategory, isLoading, deletePermission } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingPermission, setDeletingPermission] = useState<string | null>(null);

  const handleDeletePermission = async (permissionId: string) => {
    setDeletingPermission(permissionId);
    try {
      await deletePermission(permissionId);
    } finally {
      setDeletingPermission(null);
    }
  };

  const filteredPermissions = React.useMemo(() => {
    if (!searchQuery) return permissionsByCategory;
    
    const filtered: Record<string, Permission[]> = {};
    Object.entries(permissionsByCategory).forEach(([category, permissions]) => {
      const matchingPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingPermissions.length > 0) {
        filtered[category] = matchingPermissions;
      }
    });
    return filtered;
  }, [permissionsByCategory, searchQuery]);

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
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalPermissions = Object.values(permissionsByCategory).flat().length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            Permissions Management
          </h2>
          <p className="text-muted-foreground">Manage system permissions and capabilities</p>
        </div>
        <Button onClick={onCreatePermission} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Permission
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {Object.values(filteredPermissions).flat().length} of {totalPermissions} permissions
        </Badge>
      </div>

      <div className="space-y-6">
        {Object.entries(filteredPermissions).map(([category, permissions]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{category}</span>
                <Badge>{permissions.length} permissions</Badge>
              </CardTitle>
              <CardDescription>
                Permissions related to {category} operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {permissions.map(permission => (
                  <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{permission.name}</h4>
                        {permission.is_active ? (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      {permission.description && (
                        <p className="text-sm text-muted-foreground mt-1">
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
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingPermission === permission.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the permission "{permission.name}"? This action cannot be undone and may affect existing roles.
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
        ))}

        {Object.keys(filteredPermissions).length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">
                {searchQuery ? 'No permissions found' : 'No permissions available'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first permission.'
                }
              </p>
              {!searchQuery && (
                <Button onClick={onCreatePermission}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Permission
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
