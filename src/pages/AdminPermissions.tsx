
import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSwipe } from "@/hooks/use-swipe";

const AdminPermissions = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Add swipe gesture to navigate back
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeRight: () => {
      if (isMobile) {
        navigate(-1);
      }
    }
  });

  // Check for superadmin access
  if (user?.role !== "superadmin") {
    React.useEffect(() => {
      toast.error("Access denied", {
        description: "You need superadmin privileges to access this area"
      });
      navigate("/");
    }, [navigate]);
    return null;
  }
  
  // Mock permission structure for display
  const permissionsByCategory = {
    "Property": {
      "viewProperties": {
        title: "View Properties",
        description: "View property listings and details",
        allowedRoles: ["superadmin", "tenant_admin", "property_manager"]
      },
      "manageProperties": {
        title: "Manage Properties", 
        description: "Create, edit, and delete properties",
        allowedRoles: ["superadmin", "tenant_admin"]
      }
    },
    "Task": {
      "viewAllTasks": {
        title: "View All Tasks",
        description: "View all system tasks regardless of assignment",
        allowedRoles: ["superadmin", "tenant_admin", "property_manager"]
      },
      "assignTasks": {
        title: "Assign Tasks",
        description: "Assign tasks to team members",
        allowedRoles: ["superadmin", "tenant_admin", "property_manager"]
      }
    },
    "User": {
      "viewUsers": {
        title: "View Users",
        description: "View user profiles and information",
        allowedRoles: ["superadmin", "tenant_admin"]
      },
      "manageUsers": {
        title: "Manage Users",
        description: "Create, edit, and manage user accounts",
        allowedRoles: ["superadmin", "tenant_admin"]
      }
    },
    "Inventory": {
      "viewInventory": {
        title: "View Inventory",
        description: "View inventory levels and items",
        allowedRoles: ["superadmin", "tenant_admin", "property_manager", "inventory_manager", "housekeeping_staff", "maintenance_staff"]
      },
      "manageInventory": {
        title: "Manage Inventory",
        description: "Add, edit, and manage inventory items",
        allowedRoles: ["superadmin", "tenant_admin", "inventory_manager"]
      }
    }
  };
  
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
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-1 px-0 text-left">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="md:text-3xl font-bold tracking-tight flex items-center text-xl px-0 text-left">
                <Shield className="mr-2 h-7 w-7" /> System Permissions
              </h1>
              <p className="text-sm text-muted-foreground tracking-tight">
                View and understand the permission structure of the system
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(permissionsByCategory).map(([category, permissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category} Permissions</CardTitle>
                <CardDescription>
                  Permissions related to {category.toLowerCase()} operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(permissions).map(([key, permission]) => (
                    <div key={key} className="p-4 border rounded-md">
                      <h3 className="font-medium">{permission.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {permission.description}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-xs text-muted-foreground font-medium">Allowed roles:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {permission.allowedRoles.map(role => (
                            <span key={role} className="px-2 py-0.5 bg-secondary/50 text-xs rounded-full">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPermissions;
