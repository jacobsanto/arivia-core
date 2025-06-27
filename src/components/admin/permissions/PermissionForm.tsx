
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Permission } from '@/types/role-permission';
import { usePermissions } from '@/hooks/usePermissions';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required').max(100, 'Permission name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.string().min(1, 'Category is required'),
  tenant_id: z.string().min(1, 'Tenant ID is required'),
  is_active: z.boolean()
});

const PERMISSION_CATEGORIES = [
  'tasks',
  'bookings',
  'properties',
  'users',
  'roles',
  'housekeeping',
  'maintenance',
  'inventory',
  'reports',
  'admin',
  'general'
];

interface PermissionFormProps {
  permission?: Permission | null;
  onBack: () => void;
  onSaved: () => void;
}

export const PermissionForm: React.FC<PermissionFormProps> = ({ permission, onBack, onSaved }) => {
  const { createPermission, updatePermission } = usePermissions();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tenant_id: 'default-tenant-id', // You'll need to get this from context
    is_active: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description || '',
        category: permission.category,
        tenant_id: permission.tenant_id,
        is_active: permission.is_active
      });
    }
  }, [permission]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = permissionSchema.parse(formData);
      
      if (permission) {
        await updatePermission(permission.id, validatedData);
      } else {
        await createPermission(validatedData);
      }
      
      toast.success(permission ? 'Permission updated successfully' : 'Permission created successfully');
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
        toast.error('Failed to save permission');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Permissions
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {permission ? 'Edit Permission' : 'Create New Permission'}
          </h2>
          <p className="text-muted-foreground">
            {permission ? 'Update permission details' : 'Define a new system permission'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Permission Details</CardTitle>
            <CardDescription>Basic information about the permission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Permission Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., tasks:create, users:view"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              <p className="text-xs text-muted-foreground">
                Use a clear, descriptive name like "category:action" format
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this permission allows users to do"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
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
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked as boolean)}
              />
              <Label htmlFor="is_active">Active Permission</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Permission'}
          </Button>
        </div>
      </form>
    </div>
  );
};
