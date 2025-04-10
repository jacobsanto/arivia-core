import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURE_PERMISSIONS } from "@/types/auth";
import { toast } from "sonner";
const AdminPermissions = () => {
  const {
    user
  } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Check for superadmin access
  if (user?.role !== "superadmin") {
    // Redirect non-superadmins away
    React.useEffect(() => {
      toast.error("Access denied", {
        description: "You need superadmin privileges to access this area"
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
  return <>
      <Helmet>
        <title>System Permissions - Arivia Villa Sync</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isMobile && <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>}
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
      </div>
    </>;
};
export default AdminPermissions;