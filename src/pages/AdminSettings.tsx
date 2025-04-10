
import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const AdminSettings = () => {
  const { user } = useUser();
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
  
  return (
    <>
      <Helmet>
        <title>System Settings - Arivia Villa Sync</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="mr-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center">
                <Settings className="mr-2 h-7 w-7" /> System Settings
              </h1>
              <p className="text-sm text-muted-foreground tracking-tight">
                Configure global system settings
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Manage global system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                System settings configuration will be implemented soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
