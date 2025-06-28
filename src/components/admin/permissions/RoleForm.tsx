
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import { Role, CreateRoleData, UpdateRoleData } from '@/types/role-permission';
import { useRoles } from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { useUser } from '@/contexts/UserContext';

interface RoleFormProps {
  role?: Role;
  onBack: () => void;
  onSaved: () => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({ 
  role, 
  onBack, 
  onSaved 
}) => {
  const { createRole, updateRole, assignPermissionsToRole, getRoleWithPermissions } = useRoles();
  const { permissionsByCategory } = usePermissions();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        is_active: role.is_active
      });
      
      // Load role permissions
      loadRolePermissions();
    }
  }, [role]);

  const loadRolePermissions = async () => {
    if (!role) return;
    
    setLoadingPermissions(true);
    try {
      const roleWithPermissions = await getRoleWithPermissions(role.id);
      if (roleWithPermissions) {
        setSelectedPermissions(roleWithPermissions.permissions.map(p => p.id));
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      let savedRole: Role;
      
      if (role) {
        // Update existing role
        const updates: UpdateRoleData = {
          name: formData.name,
          description: formData.description,
          is_active: formData.is_active
        };
        savedRole = await updateRole(role.id, updates);
      } else {
        // Create new role
        const newRole: CreateRoleData = {
          tenant_id: user.id, // Using user.id as tenant_id for now
          name: formData.name,
          description: formData.description,
          is_active: formData.is_active
        };
        savedRole = await createRole(newRole);
      }
      
      // Assign permissions to role
      await assignPermissionsToRole(savedRole.id, selectedPermissions);
      
      onSaved();
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {role ? 'Edit Role' : 'Create Role'}
          </h2>
          <p className="text-muted-foreground">
            {role ? `Editing ${role.name}` : 'Create a new system role'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Details
            </CardTitle>
            <CardDescription>
              Configure the basic role information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Property Manager"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role and its responsibilities..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_active: !!checked }))
                }
              />
              <Label htmlFor="is_active">Active Role</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              {loadingPermissions ? 'Loading permissions...' : 'Select the permissions for this role'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPermissions ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="font-medium mb-3 capitalize">{category} Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map(permission => (
                        <div key={permission.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={permission.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.label}
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || loadingPermissions}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Role'}
          </Button>
        </div>
      </form>
    </div>
  );
};
