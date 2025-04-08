
import React, { useState, useEffect } from 'react';
import { User, FEATURE_PERMISSIONS, getDefaultPermissionsForRole } from "@/types/auth";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Shield, Save, RefreshCw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PermissionManagementProps {
  selectedUser: User | null;
}

const PermissionManagement: React.FC<PermissionManagementProps> = ({ selectedUser }) => {
  const { user: currentUser, updateUserPermissions } = useUser();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
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
      // Start with default role-based permissions
      const defaultPermissions = getDefaultPermissionsForRole(selectedUser.role, selectedUser.secondaryRoles);
      
      // Override with any custom permissions
      const initialPermissions = {
        ...defaultPermissions,
        ...(selectedUser.customPermissions || {})
      };
      
      setPermissions(initialPermissions);
    }
  }, [selectedUser]);
  
  // Only superadmins can access this component
  if (currentUser?.role !== "superadmin" || !selectedUser) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            User Permissions
          </CardTitle>
          <CardDescription>
            Only Super Admins can manage user permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 opacity-20" />
              <p className="mt-2">You don't have permission to manage user permissions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handlePermissionToggle = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleSave = () => {
    setIsSaving(true);
    
    // Artificial delay to show loading state
    setTimeout(() => {
      updateUserPermissions(selectedUser.id, permissions);
      setIsSaving(false);
    }, 500);
  };
  
  const handleResetToDefault = () => {
    if (confirm("Are you sure you want to reset to default permissions based on role?")) {
      const defaultPermissions = getDefaultPermissionsForRole(selectedUser.role, selectedUser.secondaryRoles);
      setPermissions(defaultPermissions);
      toast.info("Permissions reset to role defaults", {
        description: "Changes won't be saved until you click Save"
      });
    }
  };
  
  // Filter permissions based on selected category
  const getFilteredPermissions = () => {
    if (activeCategory === "all") {
      return Object.keys(FEATURE_PERMISSIONS);
    }
    
    return permissionGroups[activeCategory as keyof typeof permissionGroups] || [];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Manage User Permissions
        </CardTitle>
        <CardDescription>
          Customize permissions for {selectedUser.name} ({selectedUser.email})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h4 className="text-sm font-semibold">Current Role: {selectedUser.role}</h4>
              <p className="text-xs text-muted-foreground">Customized permissions will override role-based permissions</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetToDefault}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to Default
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1"
                size="sm"
              >
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full overflow-x-auto flex flex-nowrap">
              <TabsTrigger value="all">All Permissions</TabsTrigger>
              {Object.keys(permissionGroups).map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-4">
              <Accordion type="multiple" className="w-full">
                {Object.entries(permissionGroups)
                  .filter(([category]) => activeCategory === "all" || category === activeCategory)
                  .map(([category, permKeys]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="hover:bg-muted/50 px-2">
                        {category} ({permKeys.filter(key => permissions[key]).length}/{permKeys.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 px-2">
                          {permKeys.map(permKey => {
                            const permission = FEATURE_PERMISSIONS[permKey];
                            if (!permission) return null;
                            
                            const isCustomized = selectedUser.customPermissions?.[permKey] !== undefined;
                            const hasAccess = permissions[permKey] || false;
                            
                            return (
                              <div 
                                key={permKey} 
                                className={`flex items-center justify-between p-2 rounded-md ${
                                  isCustomized ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="mr-4">
                                  <p className="text-sm font-medium">{permission.title}</p>
                                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                                  {isCustomized && (
                                    <span className="text-xs text-blue-600">(Customized)</span>
                                  )}
                                </div>
                                <Switch 
                                  checked={hasAccess} 
                                  onCheckedChange={() => handlePermissionToggle(permKey)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionManagement;
