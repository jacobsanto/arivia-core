import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { SystemPermission, CreatePermissionData, UpdatePermissionData, PERMISSION_CATEGORIES, PERMISSION_CATEGORY_LABELS } from '@/types/permissions.types';

interface PermissionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePermissionData) => Promise<SystemPermission>;
  onUpdate?: (id: string, data: UpdatePermissionData) => Promise<SystemPermission>;
  permission?: SystemPermission;
  isLoading: boolean;
}

export const PermissionEditorModal: React.FC<PermissionEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  permission,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    permission_key: '',
    permission_name: '',
    description: '',
    category: undefined as string | undefined,
    is_active: true
  });

  useEffect(() => {
    if (permission) {
      setFormData({
        permission_key: permission.permission_key,
        permission_name: permission.permission_name,
        description: permission.description || '',
        category: permission.category,
        is_active: permission.is_active
      });
    } else {
      setFormData({
        permission_key: '',
        permission_name: '',
        description: '',
        category: undefined,
        is_active: true
      });
    }
  }, [permission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.permission_key.trim() || !formData.permission_name.trim() || !formData.category) {
      return;
    }

    try {
      if (permission && onUpdate) {
        await onUpdate(permission.id, {
          permission_name: formData.permission_name.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          is_active: formData.is_active
        });
      } else {
        await onSave({
          permission_key: formData.permission_key.trim(),
          permission_name: formData.permission_name.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const isValid = formData.permission_key.trim() && formData.permission_name.trim() && formData.category;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {permission ? 'Edit Permission' : 'Create New Permission'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="permission_key">Permission Key *</Label>
              <Input
                id="permission_key"
                value={formData.permission_key}
                onChange={(e) => setFormData(prev => ({ ...prev, permission_key: e.target.value }))}
                placeholder="e.g., housekeeping.tasks.create"
                disabled={!!permission} // Don't allow editing permission key for existing permissions
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for this permission (cannot be changed after creation)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permission_name">Permission Name *</Label>
              <Input
                id="permission_name"
                value={formData.permission_name}
                onChange={(e) => setFormData(prev => ({ ...prev, permission_name: e.target.value }))}
                placeholder="e.g., Create Housekeeping Tasks"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select permission category" />
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {PERMISSION_CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this permission allows users to do..."
              rows={3}
            />
          </div>

          {permission && (
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {permission ? 'Update Permission' : 'Create Permission'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};