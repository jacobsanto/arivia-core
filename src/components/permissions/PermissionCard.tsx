import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SystemPermission, PERMISSION_CATEGORY_LABELS } from '@/types/permissions.types';
import { Edit2, Trash2, Shield } from 'lucide-react';

interface PermissionCardProps {
  permission: SystemPermission;
  onEdit: (permission: SystemPermission) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
}

export const PermissionCard: React.FC<PermissionCardProps> = ({
  permission,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-slate-100 text-slate-800 border-slate-200',
      housekeeping: 'bg-blue-100 text-blue-800 border-blue-200',
      maintenance: 'bg-purple-100 text-purple-800 border-purple-200',
      inventory: 'bg-green-100 text-green-800 border-green-200',
      administration: 'bg-red-100 text-red-800 border-red-200',
      reporting: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      chat: 'bg-pink-100 text-pink-800 border-pink-200',
      properties: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">{permission.permission_name}</CardTitle>
          </div>
          <Badge 
            variant="outline"
            className={getCategoryColor(permission.category)}
          >
            {PERMISSION_CATEGORY_LABELS[permission.category as keyof typeof PERMISSION_CATEGORY_LABELS] || permission.category}
          </Badge>
        </div>
        <CardDescription className="text-sm font-mono text-muted-foreground">
          {permission.permission_key}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {permission.description && (
            <p className="text-sm text-muted-foreground">
              {permission.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Badge 
              variant={permission.is_active ? "default" : "secondary"}
            >
              {permission.is_active ? 'Active' : 'Inactive'}
            </Badge>

            {showActions && permission.is_active && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(permission)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(permission.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};