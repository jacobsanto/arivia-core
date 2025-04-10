
import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, AlertTriangle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminSettings = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Mock settings (would be fetched from API in a real app)
  const [settings, setSettings] = React.useState({
    enableOfflineMode: true,
    enableNotifications: true,
    enableEmailAlerts: false,
    autoAssignTasks: true,
    enableAIPredictions: false,
    enableDebugMode: false,
    enableMaintenanceMode: false
  });
  
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
  
  const handleToggleSetting = (setting: keyof typeof settings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [setting]: !prev[setting] };
      
      // In a real app, this would be an API call
      toast.success("Setting updated", {
        description: `${setting} is now ${newSettings[setting] ? "enabled" : "disabled"}`
      });
      
      return newSettings;
    });
  };
  
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
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure core application behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-offline">Enable Offline Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to work offline with data synchronization
                    </p>
                  </div>
                  <Switch 
                    id="enable-offline" 
                    checked={settings.enableOfflineMode} 
                    onCheckedChange={() => handleToggleSetting('enableOfflineMode')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-notifications">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show in-app notifications for important events
                    </p>
                  </div>
                  <Switch 
                    id="enable-notifications" 
                    checked={settings.enableNotifications}
                    onCheckedChange={() => handleToggleSetting('enableNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-email-alerts">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for critical events
                    </p>
                  </div>
                  <Switch 
                    id="enable-email-alerts" 
                    checked={settings.enableEmailAlerts}
                    onCheckedChange={() => handleToggleSetting('enableEmailAlerts')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Configure how tasks are assigned and managed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-assign">Auto-assign Tasks</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically assign tasks based on staff availability
                    </p>
                  </div>
                  <Switch 
                    id="auto-assign" 
                    checked={settings.autoAssignTasks}
                    onCheckedChange={() => handleToggleSetting('autoAssignTasks')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-ai">AI Task Suggestions</Label>
                    <p className="text-sm text-muted-foreground">
                      Use AI to predict and suggest optimal task assignments
                    </p>
                  </div>
                  <Switch 
                    id="enable-ai" 
                    checked={settings.enableAIPredictions}
                    onCheckedChange={() => handleToggleSetting('enableAIPredictions')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200">
            <CardHeader className="border-b border-amber-200">
              <CardTitle className="flex items-center text-amber-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
              <CardDescription className="text-amber-600">
                These settings should only be changed by system administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debug-mode" className="font-medium">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging and debugging tools
                    </p>
                  </div>
                  <Switch 
                    id="debug-mode" 
                    checked={settings.enableDebugMode}
                    onCheckedChange={() => handleToggleSetting('enableDebugMode')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode" className="font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Put the system in maintenance mode (users will be logged out)
                    </p>
                  </div>
                  <Switch 
                    id="maintenance-mode" 
                    checked={settings.enableMaintenanceMode}
                    onCheckedChange={() => handleToggleSetting('enableMaintenanceMode')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
