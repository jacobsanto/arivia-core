import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { User } from "@/types/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MobileUserCard from "../MobileUserCard";
import UserTableRow from "./UserTableRow";
import { Skeleton } from "@/components/ui/skeleton";

interface UserRolesListProps {
  users: User[];
  currentUser: User | null;
  isLoading?: boolean;
  onEditPermissions: (user: User) => User;
  onDeleteClick: (user: User) => void;
  setActiveTab: (tab: string) => void;
  setSelectedUser: (user: User) => void;
}

const UserRolesList: React.FC<UserRolesListProps> = ({
  users,
  currentUser,
  isLoading = false,
  onEditPermissions,
  onDeleteClick,
  setActiveTab,
  setSelectedUser
}) => {
  const isMobile = useIsMobile();
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  
  const toggleExpandUser = (userId: string) => {
    setExpandedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  const handleEditPermissions = (user: User) => {
    setSelectedUser(user);
    setActiveTab("permissions");
    return onEditPermissions(user);
  };

  // Loading skeletons
  if (isLoading) {
    if (isMobile) {
      return (
        <div className="space-y-2 px-[3px]">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map(i => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
  
  // Mobile view - Card-based layout
  if (isMobile) {
    return (
      <div className="space-y-2 px-[3px]">
        {users.length > 0 ? users.map(user => (
          <MobileUserCard 
            key={user.id} 
            user={user} 
            currentUser={currentUser} 
            onEditRole={() => {}} // Handled within the MobileUserCard now
            onEditPermissions={() => handleEditPermissions(user)} 
            onDeleteClick={onDeleteClick} 
            isExpanded={expandedUsers.includes(user.id)} 
            toggleExpand={toggleExpandUser} 
          />
        )) : (
          <div className="text-center py-8 text-muted-foreground">
            No users found.
          </div>
        )}
      </div>
    );
  }
  
  // Desktop view - Table-based layout
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Current Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? users.map(user => (
          <UserTableRow 
            key={user.id} 
            user={user}
            currentUser={currentUser}
            onEditPermissions={() => handleEditPermissions(user)}
            onDeleteClick={onDeleteClick}
          />
        )) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default UserRolesList;
