
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { offlineManager } from "@/utils/offlineManager";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger, SwipeableTabsProvider } from "@/components/ui/tabs";
import { DatabaseZap, Shield, User, CloudOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import UserInformation from "@/components/auth/UserInformation";
import SecurityActivity from "@/components/auth/SecurityActivity";
import PermissionsDisplay from "@/components/auth/PermissionsDisplay";

const UserProfile = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { canAccess } = usePermissions();
  const [syncingData, setSyncingData] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const isMobile = useIsMobile();
  const tabsRef = useRef(null);
  
  const offlineData = offlineManager.getOfflineDataSummary();
  const totalOfflineItems = offlineData.total;
  
  const handleSyncData = async () => {
    setSyncingData(true);
    try {
      await offlineManager.syncOfflineData();
      toast({
        title: "Data synchronized",
        description: "All your offline changes have been uploaded"
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
    } finally {
      setSyncingData(false);
    }
  };

  const handleClearOfflineData = () => {
    try {
      localStorage.removeItem(offlineManager["STORAGE_KEY"]);
      toast({
        title: "Offline data cleared",
        description: "All cached data has been removed from your device"
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not clear offline data",
        variant: "destructive"
      });
    }
  };

  const showPermissions = user?.role === "superadmin" || canAccess("viewPermissions");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">My Profile</h1>

      <SwipeableTabsProvider>
        <Tabs ref={tabsRef} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full scroll-tabs">
            <TabsTrigger value="info" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Information
            </TabsTrigger>
            {showPermissions && (
              <TabsTrigger value="permissions" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Permissions
              </TabsTrigger>
            )}
            <TabsTrigger value="security" className="flex items-center gap-1">
              <DatabaseZap className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center gap-1">
              <CloudOff className="h-4 w-4" />
              Offline Data
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="info"
            tabsRoot={tabsRef}
          >
            <UserInformation />
          </TabsContent>

          {showPermissions && (
            <TabsContent 
              value="permissions"
              tabsRoot={tabsRef}
            >
              <PermissionsDisplay />
            </TabsContent>
          )}

          <TabsContent 
            value="security"
            tabsRoot={tabsRef}
          >
            <SecurityActivity />
          </TabsContent>

          <TabsContent 
            value="offline"
            tabsRoot={tabsRef}
          >
            <Card>
              <CardHeader>
                <CardTitle>Offline Data</CardTitle>
                <CardDescription>Manage data stored on this device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-lg text-center">
                    <div className="text-2xl font-bold">{totalOfflineItems}</div>
                    <div className="text-sm text-muted-foreground">Pending Changes</div>
                  </div>
                  {Object.entries(offlineData.summary || {}).map(([type, count]) => (
                    <div key={type} className="p-4 bg-secondary/50 rounded-lg text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground">{type}</div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="default" 
                    onClick={handleSyncData}
                    disabled={totalOfflineItems === 0 || syncingData}
                  >
                    {syncingData ? "Syncing..." : "Sync Now"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClearOfflineData}
                    disabled={totalOfflineItems === 0}
                  >
                    Clear Offline Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SwipeableTabsProvider>
    </div>
  );
};

export default UserProfile;
