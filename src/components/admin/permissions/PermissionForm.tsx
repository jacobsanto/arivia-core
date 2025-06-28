
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Permission, CreatePermissionData, UpdatePermissionData } from '@/types/role-permission';
import { usePermissions } from '@/hooks/usePermissions';
import { useUser } from '@/contexts/UserContext';

interface PermissionFormProps {
  permission?: Permission;
  onBack: () => void;
  onSaved: () => void;
}

export const PermissionForm: React.FC<PermissionFormProps> = ({ 
  permission, 
  onBack, 
  onSaved 
}) => {
  const { createPermission, updatePermission } = usePermissions();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    category: 'general',
    is_active: true
  });

  useEffect(() => {
    if (permission) {
      setFormData({
        key: permission.key,
        label: permission.label,
        description: permission.description || '',
        category: permission.category,
        is_active: permission.is_active
      });
    }
  }, [permission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      if (permission) {
        // Update existing permission
        const updates: UpdatePermissionData = {
          key: formData.key,
          label: formData.label,
          description: formData.description,
          category: formData.category,
          is_active: formData.is_active
        };
        await updatePermission(permission.id, updates);
      } else {
        // Create new permission
        const newPermission: CreatePermissionData = {
          tenant_id: user.id, // Using user.id as tenant_id for now
          key: formData.key,
          label: formData.label,
          description: formData.description,
          category: formData.category,
          is_active: formData.is_active
        };
        await createPermission(newPermission);
      }
      onSaved();
    } catch (error) {
      console.error('Error saving permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'general',
    'tasks',
    'bookings',
    'inventory',
    'properties',
    'users',
    'reports'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {permission ? 'Edit Permission' : 'Create Permission'}
          </h2>
          <p className="text-muted-foreground">
            {permission ? `Editing ${permission.label}` : 'Create a new system permission'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Details</CardTitle>
          <CardDescription>
            Configure the permission settings and access level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key">Permission Key *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="e.g., task.create"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for this permission (used in code)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Display Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Create Tasks"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Human-readable name shown in UI
                </p>
              </div>
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
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Permission'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
