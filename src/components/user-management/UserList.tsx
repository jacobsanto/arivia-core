import React from 'react';
import { Edit, Trash2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StaffMember, ROLE_LABELS, ROLE_COLORS, STATUS_COLORS } from '@/types/userManagement.types';

interface UserListProps {
  users: StaffMember[];
  loading: boolean;
  onEditUser: (user: StaffMember) => void;
  onDeleteUser: (userId: string) => void;
}

const UserList = ({ users, loading, onEditUser, onDeleteUser }: UserListProps) => {
  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            No users match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Open Tasks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    {user.phone && (
                      <div className="text-xs text-muted-foreground">{user.phone}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className={ROLE_COLORS[user.role]}>
                  {ROLE_LABELS[user.role]}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${STATUS_COLORS[user.isOnline ? 'online' : 'offline']}`}
                  />
                  <span className="text-sm">
                    {user.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {user.openTasksCount}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditUser(user)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteUser(user.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserList;