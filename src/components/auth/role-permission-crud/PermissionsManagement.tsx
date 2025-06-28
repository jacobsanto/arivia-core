
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Key } from 'lucide-react';
import { toast } from 'sonner';
import PermissionDialog from './dialogs/PermissionDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Permission {
  id: string;
  key: string;
  label: string;
  description: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  tenant_id: string;
}

const PermissionsManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingPermissionId, setDeletingPermissionId] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true })
        .order('label', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to fetch permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    try {
      setDeletingPermissionId(permissionId);
      
      // First, delete all role-permission associations
      await supabase
        .from('role_permissions')
        .delete()
        .eq('permission_id', permissionId);

      // Then delete the permission
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      toast.success('Permission deleted successfully');
      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast.error('Failed to delete permission');
    } finally {
      setDeletingPermissionId(null);
    }
  };

  const handleCreatePermission = () => {
    setSelectedPermission(null);
    setIsDialogOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPermission(null);
    fetchPermissions();
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    const category = permission.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
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
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5" />
            System Permissions
          </h3>
          <p className="text-sm text-muted-foreground">Manage system permissions and access levels</p>
        </div>
        <Button onClick={handleCreatePermission} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Permission
        </Button>
      </div>

      {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
        <div key={category} className="space-y-4">
          <h4 className="text-md font-medium capitalize flex items-center gap-2">
            <Badge variant="outline">{category}</Badge>
            <span className="text-sm text-muted-foreground">({categoryPermissions.length} permissions)</span>
          </h4>
          
          <div className="grid gap-4">
            {categoryPermissions.map(permission => (
              <Card key={permission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {permission.label}
                        {permission.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div><strong>Key:</strong> {permission.key}</div>
                        {permission.description && <div>{permission.description}</div>}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPermission(permission)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingPermissionId === permission.id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the permission "{permission.label}"? This will also remove it from all roles. This action cannot be undone.
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
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {permissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No permissions found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first permission.</p>
            <Button onClick={handleCreatePermission}>
              <Plus className="h-4 w-4 mr-2" />
              Create Permission
            </Button>
          </CardContent>
        </Card>
      )}

      <PermissionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        permission={selectedPermission}
      />
    </div>
  );
};

export default PermissionsManagement;
