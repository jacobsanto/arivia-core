
import React, { useState } from "react";
import { User, UserRole, ROLE_DETAILS } from "@/types/auth";
import { 
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2, AlertTriangle } from "lucide-react";
import AvatarUpload from "./avatar/AvatarUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

interface MobileUserCardProps {
  user: User;
  currentUser: User | null;
  onEditPermissions: (user: User) => void;
  onDeleteClick: (user: User) => void;
  isExpanded: boolean;
  toggleExpand: (userId: string) => void;
}

const MobileUserCard: React.FC<MobileUserCardProps> = ({
  user,
  currentUser,
  onEditPermissions,
  onDeleteClick,
  isExpanded,
  toggleExpand
}) => {
  const { updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<UserRole[]>(
    user.secondaryRoles || []
  );
  const [isSaving, setIsSaving] = useState(false);
  
  const handleEditRole = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRole(user.role);
    setSelectedSecondaryRoles(user.secondaryRoles || []);
  };
  
  const handleSaveRole = async () => {
    // Validate selection for Super Admin
    if (selectedRole === "superadmin" && selectedSecondaryRoles.length === 0) {
      toast.error("Super Admin requires at least one secondary role", {
        description: "Please select at least one additional role"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // Call the updateProfile function from UserContext
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
    <Card className="mb-3">
      <div 
        className="p-3 flex items-center justify-between cursor-pointer border-b"
        onClick={() => !isEditing && toggleExpand(user.id)}
      >
        <div className="flex items-center gap-2">
          <AvatarUpload user={user} size="sm" editable={false} />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        {!isEditing && (
          <div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
      
      {isExpanded && !isEditing && (
        <>
          <CardContent className="pt-3">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Role</p>
                <Badge variant="outline">{ROLE_DETAILS[user.role].title}</Badge>
                
                {user.secondaryRoles && user.secondaryRoles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user.secondaryRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        +{ROLE_DETAILS[role].title}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {user.customPermissions && Object.keys(user.customPermissions).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Custom Permissions</p>
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    Custom Permissions Applied
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-wrap gap-2 pt-0">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onEditPermissions(user)}
            >
              Permissions
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={handleEditRole}
            >
              Change Role
            </Button>
            {user.id !== currentUser?.id && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteClick}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </CardFooter>
        </>
      )}
      
      {isEditing && (
        <>
          <CardContent className="pt-3">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Select Role</p>
                <Select 
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_DETAILS).map(([role, details]) => (
                      <SelectItem key={role} value={role}>{details.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRole === "superadmin" && (
                <div className="p-3 border rounded-md space-y-3">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-muted-foreground">
                      Super Admin requires at least one secondary role
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(ROLE_DETAILS)
                      .filter(([role]) => role !== "superadmin") // Exclude superadmin from secondary roles
                      .map(([role, details]) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`mobile-role-${role}`} 
                            checked={selectedSecondaryRoles.includes(role as UserRole)} 
                            onCheckedChange={() => toggleSecondaryRole(role as UserRole)}
                          />
                          <label htmlFor={`mobile-role-${role}`} className="text-sm">
                            {details.title}
                          </label>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2 pt-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveRole}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default MobileUserCard;
