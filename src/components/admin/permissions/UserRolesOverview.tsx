
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserWithRoles } from '@/types/role-permission';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Search, Users, UserMinus, Edit } from 'lucide-react';

interface UserRolesOverviewProps {
  onEditUserRoles: (user: UserWithRoles) => void;
}

export const UserRolesOverview: React.FC<UserRolesOverviewProps> = ({ onEditUserRoles }) => {
  const { usersWithRoles, revokeRoleFromUser, isLoading } = useUserRoles();
  const [searchQuery, setSearchQuery] = useState('');
  const [revokingRole, setRevokingRole] = useState<{ userId: string; roleId: string } | null>(null);

  const handleRevokeRole = async (userId: string, roleId: string) => {
    setRevokingRole({ userId, roleId });
    try {
      await revokeRoleFromUser(userId, roleId);
    } finally {
      setRevokingRole(null);
    }
  };

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return usersWithRoles;
    
    return usersWithRoles.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.roles.some(role => role.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [usersWithRoles, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalUsers = usersWithRoles.length;
  const usersWithNoRoles = usersWithRoles.filter(user => user.roles.length === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Roles Overview
          </h2>
          <p className="text-muted-foreground">View and manage role assignments for all users</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {totalUsers} total users
          </Badge>
          {usersWithNoRoles > 0 && (
            <Badge variant="destructive">
              {usersWithNoRoles} without roles
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users or roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {filteredUsers.length} of {totalUsers} users
        </Badge>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map(user => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {user.name}
                    {user.roles.length === 0 && (
                      <Badge variant="destructive">No Roles</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditUserRoles(user)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Roles
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {user.roles.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map(role => (
                      <div key={role.id} className="flex items-center gap-2">
                        <Badge variant={role.is_active ? "default" : "secondary"}>
                          {role.name}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              disabled={revokingRole?.userId === user.id && revokingRole?.roleId === role.id}
                            >
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Role</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke the role "{role.name}" from {user.name}? 
                                This will remove their access to associated permissions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeRole(user.id, role.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke Role
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                  {user.roles.some(role => role.description) && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Role descriptions:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {user.roles
                          .filter(role => role.description)
                          .map(role => (
                            <li key={role.id}>
                              <span className="font-medium">{role.name}:</span> {role.description}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No roles assigned</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditUserRoles(user)}
                    className="mt-2"
                  >
                    Assign Roles
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">
                {searchQuery ? 'No users found' : 'No users available'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search criteria'
                  : 'Users will appear here once they have been assigned roles.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
