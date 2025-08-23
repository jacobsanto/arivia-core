
import { useState } from "react";
import { User, UserRole } from "@/auth/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useRoleActions = () => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("administrator");
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<UserRole[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
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

    setIsSaving(true);
    
    try {
      // Regular users cannot have secondary roles
      const updatedSecondaryRoles = selectedRole === "superadmin" ? selectedSecondaryRoles : undefined;
      
      // Update in Supabase if online
      if (navigator.onLine) {
        // Map roles to database-compatible values
        const dbRole = selectedRole as any; // Cast to bypass TypeScript issue for now
        
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            role: dbRole
            // Note: secondary_roles not implemented in current schema
          })
          .eq('user_id', userId)
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        
        
        // If we have data back, use it to update the local state
        if (data) {
          const updatedUser = {
            ...users.find(u => u.id === userId)!,
            role: data.role as UserRole,
            secondaryRoles: undefined // Not implemented in current schema
          };
          
          // Update users array
          setUsers(users.map(u => u.id === userId ? updatedUser : u));
          
          // Update localStorage for offline access
          localStorage.setItem("users", JSON.stringify(
            users.map(u => u.id === userId ? updatedUser : u)
          ));
        } else {
          // Fallback if no data is returned but no error either
          const updatedUser = {
            ...users.find(u => u.id === userId)!,
            role: selectedRole,
            secondaryRoles: updatedSecondaryRoles
          };
          
          // Update users array
          setUsers(users.map(u => u.id === userId ? updatedUser : u));
          
          // Update localStorage for offline access
          localStorage.setItem("users", JSON.stringify(
            users.map(u => u.id === userId ? updatedUser : u)
          ));
        }
      } else {
        // Offline mode - update local state only
        const updatedUser = {
          ...users.find(u => u.id === userId)!,
          role: selectedRole,
          secondaryRoles: updatedSecondaryRoles
        };
        
        // Update users array
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        
        // Update localStorage for offline access
        localStorage.setItem("users", JSON.stringify(
          users.map(u => u.id === userId ? updatedUser : u)
        ));
        
        toast.warning("You're offline", {
          description: "Changes will sync when you reconnect"
        });
      }
      
      setEditingUserId(null);
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("Failed to update user role", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsSaving(false);
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
    toggleSecondaryRole,
    isSaving
  };
};
