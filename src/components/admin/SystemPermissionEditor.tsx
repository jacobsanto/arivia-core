import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Save, X, Edit2 } from "lucide-react";
import { SystemPermission } from "@/hooks/useSystemPermissions";
import { UserRole } from "@/types/auth";

interface SystemPermissionEditorProps {
  permission: SystemPermission;
  onUpdate: (id: string, updates: Partial<SystemPermission>) => Promise<void>;
  onToggleActive: (id: string, is_active: boolean) => Promise<void>;
  onUpdateRoles: (id: string, allowed_roles: UserRole[]) => Promise<void>;
  saving: boolean;
}

const ALL_ROLES: UserRole[] = [
  'superadmin',
  'administrator', 
  'property_manager',
  'housekeeping_staff',
  'maintenance_staff',
  'inventory_manager',
  'concierge'
];

const SystemPermissionEditor: React.FC<SystemPermissionEditorProps> = ({
  permission,
  onUpdate,
  onToggleActive,
  onUpdateRoles,
  saving
}) => {
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(permission.title);
  const [editedDescription, setEditedDescription] = useState(permission.description);
  const [editedRoles, setEditedRoles] = useState<UserRole[]>(permission.allowed_roles);

  const handleSave = async () => {
    await onUpdate(permission.id, {
      title: editedTitle,
      description: editedDescription
    });
    await onUpdateRoles(permission.id, editedRoles);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(permission.title);
    setEditedDescription(permission.description);
    setEditedRoles(permission.allowed_roles);
    setEditing(false);
  };

  const handleRoleToggle = (role: UserRole, checked: boolean) => {
    if (checked) {
      setEditedRoles(prev => [...prev, role]);
    } else {
      setEditedRoles(prev => prev.filter(r => r !== role));
    }
  };

  return (
    <Card className={`border-l-4 ${permission.is_active ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={permission.is_active}
              onCheckedChange={(checked) => onToggleActive(permission.id, checked)}
              disabled={saving}
            />
            <div>
              {editing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-b border-primary/20 focus:border-primary outline-none"
                />
              ) : (
                <CardTitle className="text-lg">{permission.title}</CardTitle>
              )}
              <p className="text-sm text-muted-foreground">
                Key: <code className="text-xs">{permission.permission_key}</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {editing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full min-h-[60px] bg-transparent border border-primary/20 focus:border-primary outline-none rounded p-2 resize-none"
            />
          ) : (
            permission.description
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Allowed Roles</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {editing ? (
                <div className="grid grid-cols-2 gap-2 w-full">
                  {ALL_ROLES.map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${permission.id}-${role}`}
                        checked={editedRoles.includes(role)}
                        onCheckedChange={(checked) => handleRoleToggle(role, checked === true)}
                      />
                      <Label
                        htmlFor={`${permission.id}-${role}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                permission.allowed_roles.map(role => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))
              )}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(permission.updated_at).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemPermissionEditor;