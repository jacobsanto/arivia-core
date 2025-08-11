
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Settings, Save, RotateCcw } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FEATURE_PERMISSIONS } from "@/types/auth";
import { toast } from "sonner";
import { useSwipe } from "@/hooks/use-swipe";
import { useSystemPermissions } from "@/hooks/useSystemPermissions";
import SystemPermissionEditor from "@/components/admin/SystemPermissionEditor";

const AdminPermissions = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("view");
  
  const {
    permissions: systemPermissions,
    loading,
    saving,
    updatePermission,
    togglePermissionActive,
    updateAllowedRoles,
    refreshPermissions
  } = useSystemPermissions();
  
  // Add swipe gesture to navigate back
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeRight: () => {
      if (isMobile) {
        navigate(-1);
      }
    }
  });

  // Check for elevated access: Superadmin or Admin in Dev Mode
  const devMode = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks, @typescript-eslint/no-var-requires
      const { useDevMode } = require('@/contexts/DevModeContext');
      return useDevMode();
    } catch {
      return null;
    }
  })();
  const isElevated = (user?.role === "superadmin") || (devMode?.isDevMode && user?.role === "administrator");
  if (!isElevated) {
    // Redirect non-elevated users away
    React.useEffect(() => {
      toast.error("Access denied", {
        description: "You need elevated privileges to access this area"
      });
      navigate("/");
    }, [navigate]);
    return null;
  }
  
  const permissionsByCategory = React.useMemo(() => {
    const categories: Record<string, typeof FEATURE_PERMISSIONS> = {
      "Property": {},
      "Task": {},
      "User": {},
      "Inventory": {},
      "Report": {},
      "Other": {}
    };
    Object.entries(FEATURE_PERMISSIONS).forEach(([key, value]) => {
      if (key.includes("propert")) {
        categories["Property"][key] = value;
      } else if (key.includes("task") || key.includes("housekeeping") || key.includes("maintenance")) {
        categories["Task"][key] = value;
      } else if (key.includes("user") || key.includes("manage") || key.includes("admin")) {
        categories["User"][key] = value;
      } else if (key.includes("inventor") || key.includes("stock") || key.includes("order")) {
        categories["Inventory"][key] = value;
      } else if (key.includes("report") || key.includes("analytics")) {
        categories["Report"][key] = value;
      } else {
        categories["Other"][key] = value;
      }
    });
    return categories;
  }, []);

  const systemPermissionsByCategory = React.useMemo(() => {
    const categories: Record<string, typeof systemPermissions> = {
      "Property": [],
      "Task": [],
      "User": [],
      "Inventory": [],
      "Report": [],
      "Other": []
    };
    systemPermissions.forEach(permission => {
      const key = permission.permission_key;
      if (key.includes("propert")) {
        categories["Property"].push(permission);
      } else if (key.includes("task") || key.includes("housekeeping") || key.includes("maintenance")) {
        categories["Task"].push(permission);
      } else if (key.includes("user") || key.includes("manage") || key.includes("admin")) {
        categories["User"].push(permission);
      } else if (key.includes("inventor") || key.includes("stock") || key.includes("order")) {
        categories["Inventory"].push(permission);
      } else if (key.includes("report") || key.includes("analytics")) {
        categories["Report"].push(permission);
      } else {
        categories["Other"].push(permission);
      }
    });
    return categories;
  }, [systemPermissions]);
  
  const gestureProps = isMobile ? {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } : {};
  
  return (
    <div {...gestureProps}>
      <Helmet>
        <title>System Permissions - Arivia Villa Sync</title>
      </Helmet>
      
        <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isMobile && <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-1 px-0 text-left">
                <ArrowLeft className="h-5 w-5" />
              </Button>}
            <div>
              <h1 className="md:text-3xl font-bold tracking-tight flex items-center text-xl px-0 text-left">
                <Shield className="mr-2 h-7 w-7" /> System Permissions
              </h1>
              <p className="text-sm text-muted-foreground tracking-tight">
                View and manage the permission structure of the system
              </p>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              View Permissions
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Permissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                if (Object.keys(permissions).length === 0) return null;
                return <Card key={category}>
                  <CardHeader>
                    <CardTitle>{category} Permissions</CardTitle>
                    <CardDescription>
                      Permissions related to {category.toLowerCase()} operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(permissions).map(([key, permission]) => <div key={key} className="p-4 border rounded-md">
                          <h3 className="font-medium">{permission.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                          <div className="mt-2">
                            <h4 className="text-xs text-muted-foreground font-medium">Allowed roles:</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {permission.allowedRoles.map(role => <span key={role} className="px-2 py-0.5 bg-secondary/50 text-xs rounded-full">
                                  {role}
                                </span>)}
                            </div>
                          </div>
                        </div>)}
                    </div>
                  </CardContent>
                </Card>;
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(systemPermissionsByCategory).map(([category, permissions]) => {
                  if (permissions.length === 0) return null;
                  return (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle>{category} Permissions</CardTitle>
                        <CardDescription>
                          Edit permissions related to {category.toLowerCase()} operations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {permissions.map(permission => (
                            <SystemPermissionEditor
                              key={permission.id}
                              permission={permission}
                              onUpdate={updatePermission}
                              onToggleActive={togglePermissionActive}
                              onUpdateRoles={updateAllowedRoles}
                              saving={saving}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPermissions;
