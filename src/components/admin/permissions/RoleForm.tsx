
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Role, Permission, RoleWithPermissions } from '@/types/role-permission';
import { useRoles } from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Role name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  tenant_id: z.string().min(1, 'Tenant ID is required'),
  is_active: z.boolean()
});

interface RoleFormProps {
  role?: Role | null;
  onBack: () => void;
  onSaved: () => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({ role, onBack, onSaved }) => {
  const { createRole, updateRole, assignPermissionsToRole, getRoleWithPermissions } = useRoles();
  const { permissionsByCategory, isLoading: permissionsLoading } = usePermissions();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tenant_id: 'default-tenant-id', // You'll need to get this from context
    is_active: true
  });
  
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        tenant_id: role.tenant_id,
        is_active: role.is_active
      });

      // Load role permissions
      getRoleWithPermissions(role.id).then((roleWithPermissions) => {
        if (roleWithPermissions) {
          const permissionIds = new Set(roleWithPermissions.permissions.map(p => p.id));
          setSelectedPermissions(permissionIds);
        }
      });
    }
  }, [role, getRoleWithPermissions]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = roleSchema.parse(formData);
      
      let savedRole: Role;
      if (role) {
        savedRole = await updateRole(role.id, validatedData);
      } else {
        savedRole = await createRole(validatedData);
      }

      // Assign permissions
      await assignPermissionsToRole(savedRole.id, Array.from(selectedPermissions));
      
      toast.success(role ? 'Role updated successfully' : 'Role created successfully');
      onSaved();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Failed to save role');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const categoryCount = Object.keys(permissionsByCategory).length;
  const selectedCount = selectedPermissions.size;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
          <p className="text-muted-foreground">
            {role ? 'Update role details and permissions' : 'Define a new role with specific permissions'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>Basic information about the role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Property Manager"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role's responsibilities and scope"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked as boolean)}
              />
              <Label htmlFor="is_active">Active Role</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Permissions
              <Badge variant="outline">
                {selectedCount} of {Object.values(permissionsByCategory).flat().length} selected
              </Badge>
            </CardTitle>
            <CardDescription>Select the permissions this role should have</CardDescription>
          </CardHeader>
          <CardContent>
            {permissionsLoading ? (
              <div className="text-center py-4">Loading permissions...</div>
            ) : (
              <div className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold capitalize">{category}</h4>
                      <Badge variant="secondary">
                        {permissions.filter(p => selectedPermissions.has(p.id)).length} / {permissions.length}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
                      {permissions.map(permission => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.has(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={permission.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {Object.keys(permissionsByCategory).indexOf(category) < categoryCount - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Role'}
          </Button>
        </div>
      </form>
    </div>
  );
};
