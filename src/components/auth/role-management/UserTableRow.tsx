import React, { useState } from "react";
import { User, UserRole, ROLE_DETAILS } from "@/types/auth";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, AlertTriangle } from "lucide-react";
import AvatarUpload from "../avatar/AvatarUpload";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

interface UserTableRowProps {
  user: User;
  currentUser: User | null;
  onEditPermissions: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  currentUser,
  onEditPermissions,
  onDeleteClick
}) => {
  const { updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<UserRole[]>(
    user.secondaryRoles || []
  );
  const [isSaving, setIsSaving] = useState(false);
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRole(user.role);
    setSelectedSecondaryRoles(user.secondaryRoles || []);
  };
  
  const handleSaveRole = async () => {
    if (selectedRole === "superadmin" && selectedSecondaryRoles.length === 0) {
      toast.error("Super Admin requires at least one secondary role", {
        description: "Please select at least one additional role"
      });
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateProfile(user.id, {
        role: selectedRole,
        secondaryRoles: selectedRole === "superadmin" ? selectedSecondaryRoles : undefined
      });
      
      if (success) {
        setIsEditing(false);
        toast.success("User role updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update role", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      console.error("Error updating role:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleSecondaryRole = (role: UserRole) => {
    setSelectedSecondaryRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };
  
  const handleDeleteClick = () => {
    if (user.id === currentUser?.id) {
      toast.error("Cannot delete your own account", {
        description: "You cannot delete your own user account"
      });
      return;
    }
    onDeleteClick(user);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <AvatarUpload user={user} size="sm" editable={false} />
          <span className="font-medium">{user.name}</span>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {isEditing ? (
          <div className="space-y-4">
            <select 
              className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as UserRole)}
            >
              {Object.entries(ROLE_DETAILS).map(([role, details]) => (
                <option key={role} value={role}>{details.title}</option>
              ))}
            </select>
            
            {selectedRole === "superadmin" && (
              <div className="p-3 border rounded-md space-y-3">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    Super Admin requires at least one secondary role
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(ROLE_DETAILS)
                    .filter(([role]) => role !== "superadmin")
                    .map(([role, details]) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`role-${role}`} 
                          checked={selectedSecondaryRoles.includes(role as UserRole)} 
                          onCheckedChange={() => toggleSecondaryRole(role as UserRole)}
                        />
                        <label htmlFor={`role-${role}`} className="text-sm">
                          {details.title}
                        </label>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Badge variant="outline">{ROLE_DETAILS[user.role].title}</Badge>
            
            {user.secondaryRoles && user.secondaryRoles.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {user.secondaryRoles.map(role => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    +{ROLE_DETAILS[role].title}
                  </Badge>
                ))}
              </div>
            )}
            
            {user.customPermissions && (
              <div className="mt-1">
                <Badge variant="outline" className="text-xs bg-blue-50">
                  Custom Permissions
                </Badge>
              </div>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
              <span>Cancel</span>
            </Button>
            <Button size="sm" onClick={handleSaveRole} disabled={isSaving}>
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => onEditPermissions(user)}>
              <span>Permissions</span>
            </Button>
            <Button size="sm" variant="outline" onClick={handleEditClick}>
              <span>Change Role</span>
            </Button>
            {user.id !== currentUser?.id && (
              <Button size="sm" variant="destructive" onClick={handleDeleteClick}>
                <span className="flex items-center">
                  <Trash2 className="h-4 w-4" />
                </span>
              </Button>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
