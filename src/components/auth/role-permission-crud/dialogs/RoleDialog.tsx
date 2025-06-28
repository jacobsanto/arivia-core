
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  tenant_id: string;
}

interface Permission {
  id: string;
  key: string;
  label: string;
  category: string;
}

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

const RoleDialog: React.FC<RoleDialogProps> = ({ isOpen, onClose, role }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(role);

  useEffect(() => {
    if (isOpen) {
      fetchPermissions();
      if (role) {
        setFormData({
          name: role.name,
          description: role.description || '',
          is_active: role.is_active
        });
        fetchRolePermissions(role.id);
      } else {
        setFormData({
          name: '',
          description: '',
          is_active: true
        });
        setSelectedPermissions(new Set());
      }
    }
  }, [isOpen, role]);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('permissions')
        .select('id, key, label, category')
        .eq('is_active', true)
        .order('category')
        .order('label');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to fetch permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId);

      if (error) throw error;
      
      const permissionIds = new Set(data.map(rp => rp.permission_id));
      setSelectedPermissions(permissionIds);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast.error('Failed to fetch role permissions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    setIsSaving(true);
    try {
      let roleId: string;

      if (isEditing && role) {
        // Update existing role
        const { error } = await supabase
          .from('roles')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            is_active: formData.is_active
          })
          .eq('id', role.id);

        if (error) throw error;
        roleId = role.id;
      } else {
        // Create new role
        const { data, error } = await supabase
          .from('roles')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            is_active: formData.is_active,
            tenant_id: crypto.randomUUID()
          })
          .select('id')
          .single();

        if (error) throw error;
        roleId = data.id;
      }

      // Update role permissions
      // First, delete existing permissions for this role
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      // Then insert the new permissions
      if (selectedPermissions.size > 0) {
        const rolePermissions = Array.from(selectedPermissions).map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId,
          tenant_id: crypto.randomUUID()
        }));

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (insertError) throw insertError;
      }

      toast.success(isEditing ? 'Role updated successfully' : 'Role created successfully');
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save role');
    } finally {
      setIsSaving(false);
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

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    const category = permission.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update role details and permissions' : 'Create a new role and assign permissions'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
                placeholder="Describe what this role is responsible for..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active Role</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Permissions</Label>
              <Badge variant="outline">
                {selectedPermissions.size} selected
              </Badge>
            </div>

            {isLoading ? (
              <div className="text-center py-4">Loading permissions...</div>
            ) : (
              <div className="space-y-6 max-h-60 overflow-y-auto">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-medium capitalize flex items-center gap-2">
                      <Badge variant="secondary">{category}</Badge>
                    </h4>
                    <div className="space-y-2 pl-4">
                      {categoryPermissions.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.has(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <Label htmlFor={permission.id} className="text-sm font-normal">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleDialog;
