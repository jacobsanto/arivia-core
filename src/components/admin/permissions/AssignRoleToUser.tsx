
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { UserWithRoles } from '@/types/role-permission';
import { useRoles } from '@/hooks/useRoles';
import { useUserRoles } from '@/hooks/useUserRoles';
import { UserPlus, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AssignRoleToUserProps {
  onBack: () => void;
}

export const AssignRoleToUser: React.FC<AssignRoleToUserProps> = ({ onBack }) => {
  const { roles, isLoading: rolesLoading } = useRoles();
  const { usersWithRoles, assignMultipleRolesToUser, isLoading: usersLoading } = useUserRoles();
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);

  const selectedUser = usersWithRoles.find(user => user.id === selectedUserId);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = usersWithRoles.find(u => u.id === userId);
    if (user) {
      setSelectedRoles(new Set(user.roles.map(role => role.id)));
    } else {
      setSelectedRoles(new Set());
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const handleAssignRoles = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    setIsAssigning(true);
    try {
      await assignMultipleRolesToUser(
        selectedUserId, 
        Array.from(selectedRoles),
        'default-tenant-id' // You'll need to get this from context
      );
      toast.success('Roles assigned successfully');
      onBack();
    } catch (error) {
      toast.error('Failed to assign roles');
    } finally {
      setIsAssigning(false);
    }
  };

  if (rolesLoading || usersLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Assign Roles to User
          </h2>
          <p className="text-muted-foreground">
            Select a user and assign roles to them
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select User</CardTitle>
          <CardDescription>Choose the user you want to assign roles to</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={handleUserSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {usersWithRoles.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <Badge variant="outline">
                      {user.roles.length} roles
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Assign Roles to {selectedUser.name}
              <Badge variant="outline">
                {selectedRoles.size} of {roles.length} selected
              </Badge>
            </CardTitle>
            <CardDescription>
              Select the roles this user should have. Current roles will be replaced.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current roles info */}
              {selectedUser.roles.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Current Roles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roles.map(role => (
                      <Badge key={role.id} variant="secondary">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Role selection */}
              <div className="space-y-3">
                <h4 className="font-medium">Available Roles:</h4>
                <div className="grid gap-3">
                  {roles.map(role => (
                    <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={role.id}
                        checked={selectedRoles.has(role.id)}
                        onCheckedChange={() => handleRoleToggle(role.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={role.id}
                          className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        >
                          {role.name}
                          {role.is_active ? (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </Label>
                        {role.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedUser && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleAssignRoles} disabled={isAssigning}>
            <Save className="h-4 w-4 mr-2" />
            {isAssigning ? 'Assigning...' : 'Assign Roles'}
          </Button>
        </div>
      )}
    </div>
  );
};
