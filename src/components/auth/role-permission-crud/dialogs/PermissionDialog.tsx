
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Permission {
  id: string;
  key: string;
  label: string;
  description: string | null;
  category: string;
  is_active: boolean;
  tenant_id: string;
}

interface PermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
}

const PERMISSION_CATEGORIES = [
  'dashboard',
  'properties',
  'tasks',
  'inventory',
  'users',
  'reports',
  'communication',
  'system',
  'other'
];

const PermissionDialog: React.FC<PermissionDialogProps> = ({ isOpen, onClose, permission }) => {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    category: 'other',
    is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(permission);

  useEffect(() => {
    if (isOpen) {
      if (permission) {
        setFormData({
          key: permission.key,
          label: permission.label,
          description: permission.description || '',
          category: permission.category,
          is_active: permission.is_active
        });
      } else {
        setFormData({
          key: '',
          label: '',
          description: '',
          category: 'other',
          is_active: true
        });
      }
    }
  }, [isOpen, permission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key.trim() || !formData.label.trim()) {
      toast.error('Key and label are required');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && permission) {
        // Update existing permission
        const { error } = await supabase
          .from('permissions')
          .update({
            key: formData.key.trim(),
            label: formData.label.trim(),
            description: formData.description.trim() || null,
            category: formData.category,
            is_active: formData.is_active
          })
          .eq('id', permission.id);

        if (error) throw error;
      } else {
        // Create new permission
        const { error } = await supabase
          .from('permissions')
          .insert({
            key: formData.key.trim(),
            label: formData.label.trim(),
            description: formData.description.trim() || null,
            category: formData.category,
            is_active: formData.is_active,
            tenant_id: crypto.randomUUID()
          });

        if (error) throw error;
      }

      toast.success(isEditing ? 'Permission updated successfully' : 'Permission created successfully');
      onClose();
    } catch (error) {
      console.error('Error saving permission:', error);
      toast.error('Failed to save permission');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Permission' : 'Create New Permission'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update permission details' : 'Create a new system permission'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Permission Key *</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
              placeholder="e.g., users.create"
              required
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this permission (lowercase, use dots for hierarchy)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Display Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g., Create Users"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this permission allows..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active Permission</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Update Permission' : 'Create Permission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionDialog;
