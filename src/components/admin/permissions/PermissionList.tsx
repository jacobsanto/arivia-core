
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Permission } from '@/types/role-permission';
import { Trash2, Edit, Plus, Key } from 'lucide-react';

interface PermissionListProps {
  onEditPermission: (permission: Permission) => void;
  onCreatePermission: () => void;
}

export const PermissionList: React.FC<PermissionListProps> = ({ 
  onEditPermission, 
  onCreatePermission 
}) => {
  // Mock data for now since the hook is deleted
  const permissions: Permission[] = [];
  const permissionsByCategory: Record<string, Permission[]> = {};
  const isLoading = false;
  const [deletingPermission, setDeletingPermission] = useState<string | null>(null);

  const handleDeletePermission = async (permissionId: string) => {
    setDeletingPermission(permissionId);
    try {
      console.log('Delete permission:', permissionId);
      // TODO: Implement actual deletion when backend is ready
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

      <Card>
        <CardContent className="text-center py-8">
          <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No permissions found</h3>
          <p className="text-muted-foreground mb-4">Permission management will be available when the backend is ready.</p>
          <Button onClick={onCreatePermission} disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Permission
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
