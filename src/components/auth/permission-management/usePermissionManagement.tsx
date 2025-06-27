import { useState, useEffect } from 'react';
import { User, getDefaultPermissionsForRole } from "@/types/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UsePermissionManagementProps {
  selectedUser: User | null;
  updateUserPermissions: (userId: string, permissions: Record<string, boolean>) => void;
}

export const usePermissionManagement = ({ 
  selectedUser, 
  updateUserPermissions 
}: UsePermissionManagementProps) => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, boolean>>({});
  
  // Group permissions by category
  const permissionGroups = {
    "Properties": [
      "viewProperties",
      "manageProperties"
    ],
    "Tasks": [
      "viewAllTasks",
      "viewAssignedTasks",
      "assignTasks"
    ],
    "Inventory": [
      "viewInventory",
      "manageInventory",
      "approveTransfers"
    ],
    "Users": [
      "viewUsers",
      "manageUsers"
    ],
    "System": [
      "manageSettings",
      "viewReports"
    ],
    "Bookings": [
      "manage_bookings"
    ],
    "Orders": [
      "create_orders",
      "approve_orders",
      "finalize_orders"
    ],
    "Reports": [
      "view_reports"
    ]
  };
  
  // Initialize permissions when user changes
  useEffect(() => {
    if (selectedUser) {
      // Load the latest profile data directly from Supabase
      const loadProfilePermissions = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('custom_permissions')
            .eq('id', selectedUser.id)
            .single();
            
          if (error) {
            console.error("Error loading profile permissions:", error);
            return;
          }
          
          // Start with default role-based permissions
          const defaultPermissions = getDefaultPermissionsForRole(selectedUser.role);
          
          // Use database custom permissions if available (preferred source of truth)
          const dbCustomPermissions = profile?.custom_permissions as Record<string, boolean> || {};
          
          console.log("Loaded permissions from database:", dbCustomPermissions);
          console.log("Default permissions:", defaultPermissions);
          
          // Combine default with custom permissions, prioritizing custom permissions
          const initialPermissions = {
            ...defaultPermissions,
            ...dbCustomPermissions
          };
          
          setPermissions(initialPermissions);
          setOriginalPermissions(initialPermissions);
          
          console.log("Initial combined permissions:", initialPermissions);
        } catch (error) {
          console.error("Error in loadProfilePermissions:", error);
        }
      };
      
      loadProfilePermissions();
    }
  }, [selectedUser]);
  
  // Subscribe to changes in the user's profile for real-time updates
  useEffect(() => {
    if (!selectedUser) return;
    
    const channel = supabase
      .channel(`profile-permissions-${selectedUser.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${selectedUser.id}`
      }, (payload) => {
        console.log("Profile permissions updated:", payload);
        if (payload.new && (payload.new as any).custom_permissions) {
          // Reload permissions when profile is updated
          const updatedCustomPermissions = (payload.new as any).custom_permissions as Record<string, boolean>;
          const defaultPermissions = getDefaultPermissionsForRole(selectedUser.role);
          
          const updatedPermissions = {
            ...defaultPermissions,
            ...updatedCustomPermissions
          };
          
          setPermissions(updatedPermissions);
          setOriginalPermissions(updatedPermissions);
          
          toast.info("Permissions updated", {
            description: "Another admin has updated this user's permissions"
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser]);
  
  const handlePermissionToggle = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleSave = async () => {
    if (!selectedUser) return;
    
    // Check if there are actual changes
    const hasChanges = Object.keys(permissions).some(
      key => permissions[key] !== originalPermissions[key]
    );
    
    if (!hasChanges) {
      toast.info("No changes to save", {
        description: "No permissions were changed"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // First, save directly to Supabase for reliability
      const { error } = await supabase
        .from('profiles')
        .update({ 
          custom_permissions: permissions 
        })
        .eq('id', selectedUser.id);
      
      if (error) {
        throw error;
      }
      
      // Then update through context to keep local state in sync
      await updateUserPermissions(selectedUser.id, permissions);
      
      // Update original permissions to match current permissions
      setOriginalPermissions({...permissions});
      
      toast.success("Permissions saved successfully", {
        description: "User permissions have been updated"
      });
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permissions", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleResetToDefault = () => {
    if (!selectedUser) return;
    
    if (confirm("Are you sure you want to reset to default permissions based on role?")) {
      const defaultPermissions = getDefaultPermissionsForRole(selectedUser.role);
      setPermissions(defaultPermissions);
      toast.info("Permissions reset to role defaults", {
        description: "Changes won't be saved until you click Save"
      });
    }
  };
  
  // Filter permissions based on selected category
  const getFilteredPermissions = () => {
    if (activeCategory === "all") {
      return Object.keys(permissionGroups).reduce((acc, group) => {
        return [...acc, ...permissionGroups[group as keyof typeof permissionGroups]];
      }, [] as string[]);
    }
    
    return permissionGroups[activeCategory as keyof typeof permissionGroups] || [];
  };
  
  return {
    permissions,
    isSaving,
    activeCategory,
    permissionGroups,
    handlePermissionToggle,
    handleSave,
    handleResetToDefault,
    setActiveCategory,
    getFilteredPermissions
  };
};

export default usePermissionManagement;
