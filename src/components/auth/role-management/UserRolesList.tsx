
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { User } from "@/types/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MobileUserCard from "../MobileUserCard";
import UserTableRow from "./UserTableRow";

interface UserRolesListProps {
  users: User[];
  currentUser: User | null;
  onEditPermissions: (user: User) => User;
  onDeleteClick: (user: User) => void;
  setActiveTab: (tab: string) => void;
  setSelectedUser: (user: User) => void;
}

const UserRolesList: React.FC<UserRolesListProps> = ({
  users,
  currentUser,
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
  
  // Mobile view - Card-based layout
  if (isMobile) {
    return (
      <div className="space-y-2 px-[3px]">
        {users.map(user => (
          <MobileUserCard 
            key={user.id} 
            user={user} 
            currentUser={currentUser} 
            onEditRole={() => {}} // Will be implemented at the table row level
            onEditPermissions={() => handleEditPermissions(user)} 
            onDeleteClick={onDeleteClick} 
            isExpanded={expandedUsers.includes(user.id)} 
            toggleExpand={toggleExpandUser} 
          />
        ))}
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
        {users.map(user => (
          <UserTableRow 
            key={user.id} 
            user={user}
            currentUser={currentUser}
            onEditPermissions={() => handleEditPermissions(user)}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default UserRolesList;
