
import { useState } from "react";
import { User, UserRole } from "@/types/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useRoleActions = () => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("administrator");
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<UserRole[]>([]);
  
  const handleEditRole = (userId: string, user: User) => {
    setEditingUserId(userId);
    setSelectedRole(user.role);
    setSelectedSecondaryRoles(user.secondaryRoles || []);
  };
  
  const handleSaveRole = async (userId: string, users: User[], setUsers: (users: User[]) => void) => {
    // Validate selection for Super Admin
    if (selectedRole === "superadmin" && selectedSecondaryRoles.length === 0) {
      toast.error("Super Admin requires at least one secondary role", {
        description: "Please select at least one additional role"
      });
      return;
    }

    try {
      // Regular users cannot have secondary roles
      const updatedSecondaryRoles = selectedRole === "superadmin" ? selectedSecondaryRoles : undefined;
      
      // Update in Supabase if online
      if (navigator.onLine) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            role: selectedRole,
            secondary_roles: updatedSecondaryRoles
          })
          .eq('id', userId);
          
        if (error) {
          throw error;
        }
      }
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? {
        ...u,
        role: selectedRole,
        secondaryRoles: updatedSecondaryRoles
      } : u));
      
      // Update localStorage for offline access
      localStorage.setItem("users", JSON.stringify(
        users.map(u => u.id === userId ? {
          ...u,
          role: selectedRole,
          secondaryRoles: updatedSecondaryRoles
        } : u)
      ));
      
      setEditingUserId(null);
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedSecondaryRoles([]);
  };
  
  const toggleSecondaryRole = (role: UserRole) => {
    setSelectedSecondaryRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };
  
  return {
    editingUserId,
    selectedRole,
    selectedSecondaryRoles,
    setSelectedRole,
    handleEditRole,
    handleSaveRole,
    handleCancelEdit,
    toggleSecondaryRole
  };
};
