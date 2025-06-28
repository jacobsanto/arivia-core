
import React, { useState } from "react";
import { User, UserRole, safeRoleCast } from "@/types/auth/base";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import UserCardHeader from "./UserCardHeader";
import UserCardContent from "./UserCardContent";
import UserCardFooter from "./UserCardFooter";
import RoleEditForm from "./RoleEditForm";

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
  const [selectedRole, setSelectedRole] = useState<UserRole>(safeRoleCast(user.role));
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<UserRole[]>(
    user.secondaryRoles?.map(role => safeRoleCast(role)) || []
  );
  const [isSaving, setIsSaving] = useState(false);
  
  const handleEditRole = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRole(safeRoleCast(user.role));
    setSelectedSecondaryRoles(user.secondaryRoles?.map(role => safeRoleCast(role)) || []);
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
      await updateProfile({
        name: user.name,
        email: user.email,
        role: selectedRole,
        secondaryRoles: selectedRole === "superladmin" ? selectedSecondaryRoles : undefined
      });
      
      setIsEditing(false);
      toast.success("User role updated successfully");
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

  return (
    <Card className="mb-3">
      <UserCardHeader 
        user={user}
        isEditing={isEditing}
        isExpanded={isExpanded}
        toggleExpand={toggleExpand}
      />
      
      {isExpanded && !isEditing && (
        <>
          <CardContent className="pt-3">
            <UserCardContent user={user} />
          </CardContent>
          
          <CardFooter>
            <UserCardFooter 
              user={user}
              currentUser={currentUser}
              onEditPermissions={onEditPermissions}
              onDeleteClick={onDeleteClick}
              handleEditRole={handleEditRole}
            />
          </CardFooter>
        </>
      )}
      
      {isEditing && (
        <>
          <CardContent className="pt-3">
            <RoleEditForm
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedSecondaryRoles={selectedSecondaryRoles}
              toggleSecondaryRole={toggleSecondaryRole}
              handleCancelEdit={handleCancelEdit}
              handleSaveRole={handleSaveRole}
              isSaving={isSaving}
            />
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default MobileUserCard;
