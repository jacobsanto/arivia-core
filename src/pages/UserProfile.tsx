
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { offlineManager } from "@/utils/offlineManager";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger, SwipeableTabsProvider } from "@/components/ui/tabs";
import { DatabaseZap, Shield, User, CloudOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import UserInformation from "@/components/auth/UserInformation";
import SecurityActivity from "@/components/auth/SecurityActivity";
import PermissionsDisplay from "@/components/auth/PermissionsDisplay";
import { SwipeIndicator } from "@/components/ui/swipe-indicator";
import { toast } from "sonner";

const UserProfile = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { canAccess } = usePermissions();
  const [syncingData, setSyncingData] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const isMobile = useIsMobile();
  const tabsRef = useRef(null);
  
  const offlineData = offlineManager.getOfflineDataSummary();
  const totalOfflineItems = offlineData.total;
  
  // Hide swipe hint after a few seconds
  useEffect(() => {
    if (showSwipeHint && isMobile) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint, isMobile]);

  // Show swipe toast message for first-time users
  useEffect(() => {
    if (isMobile) {
      const hasSeenSwipeTip = localStorage.getItem('seen_swipe_tip');
      if (!hasSeenSwipeTip) {
        toast.info("Swipe Tip", {
          description: "Swipe left or right to navigate between tabs."
        });
        localStorage.setItem('seen_swipe_tip', 'true');
      }
    }
  }, [isMobile]);
  
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

  const tabs = [
    { id: "info", label: "Information", icon: <User className="h-4 w-4" /> },
    ...(showPermissions ? [{ id: "permissions", label: "Permissions", icon: <Shield className="h-4 w-4" /> }] : []),
    { id: "security", label: "Security", icon: <DatabaseZap className="h-4 w-4" /> },
    { id: "offline", label: "Offline Data", icon: <CloudOff className="h-4 w-4" /> }
  ];
  
  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const hasNextTab = currentTabIndex < tabs.length - 1;
  const hasPrevTab = currentTabIndex > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">My Profile</h1>

      <div className="relative">
        {/* Swipe indicators for mobile users */}
        {isMobile && (
          <>
            {hasPrevTab && (
              <SwipeIndicator 
                direction="right" 
                visible={showSwipeHint}
                className="top-1/2 -translate-y-1/2" 
              />
            )}
            {hasNextTab && (
              <SwipeIndicator 
                direction="left" 
                visible={showSwipeHint}
                className="top-1/2 -translate-y-1/2" 
              />
            )}
          </>
        )}
      
        <SwipeableTabsProvider>
          <Tabs ref={tabsRef} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 w-full scroll-tabs">
              {tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
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
        
        {/* Tab navigation buttons for mobile */}
        {isMobile && (
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const prevTabIndex = Math.max(0, currentTabIndex - 1);
                setActiveTab(tabs[prevTabIndex].id);
              }}
              disabled={!hasPrevTab}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextTabIndex = Math.min(tabs.length - 1, currentTabIndex + 1);
                setActiveTab(tabs[nextTabIndex].id);
              }}
              disabled={!hasNextTab}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
