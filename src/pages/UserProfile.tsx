
import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import RoleInfo from "@/components/auth/RoleInfo";
import RoleManagement from "@/components/auth/RoleManagement";
import PermissionsDisplay from "@/components/auth/PermissionsDisplay";
import AvatarUpload from "@/components/auth/AvatarUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Shield, Database, RefreshCw, Loader2 } from "lucide-react";
import { offlineManager } from "@/utils/offlineManager";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const UserProfile = () => {
  const { user, syncUserProfile, refreshProfile } = useUser();
  const [activeTab, setActiveTab] = useState<string>("account");
  const [offlineStats, setOfflineStats] = useState({
    tasks: offlineManager.getTasks().length,
    photos: offlineManager.getPhotos().length,
    forms: offlineManager.getForms().length
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  // Sync profile with Supabase on initial load
  useEffect(() => {
    if (user) {
      refreshProfile().then(() => {
        console.log("Profile refreshed on component mount");
      });
    }
  }, []);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const handleClearOfflineData = () => {
    if (confirm("Are you sure you want to clear all offline data? This cannot be undone.")) {
      offlineManager.clearOfflineData();
      setOfflineStats({
        tasks: 0,
        photos: 0,
        forms: 0
      });
      toast.success("Offline data cleared");
    }
  };

  const handleForceSync = () => {
    toast.info("Syncing data...");
    offlineManager.syncOfflineData().then(() => {
      setOfflineStats({
        tasks: offlineManager.getTasks().length,
        photos: offlineManager.getPhotos().length,
        forms: offlineManager.getForms().length
      });
    });
  };
  
  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      const success = await syncUserProfile();
      if (success) {
        toast.success("Profile refreshed successfully", {
          description: "Your profile information is now up to date."
        });
      } else {
        toast.info("No updates needed", {
          description: "Your profile is already up to date."
        });
      }
    } catch (error) {
      toast.error("Failed to refresh profile", {
        description: "Please try again later."
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className={`container ${isMobile ? 'px-2 py-4' : 'py-6'}`}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>User Profile</h1>
          <p className="text-muted-foreground">Manage your account and permissions</p>
        </div>
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          onClick={handleRefreshProfile} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {!isMobile && "Refresh Profile"}
        </Button>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className={`bg-background border ${isMobile ? 'w-full grid grid-cols-4' : ''}`}>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className={isMobile ? "hidden" : "inline"}>Account</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className={isMobile ? "hidden" : "inline"}>Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="offline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className={isMobile ? "hidden" : "inline"}>Offline</span>
          </TabsTrigger>
          {user.role === "superadmin" && (
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "inline"}>Users</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="account" className="mt-6 space-y-6">
          <div className={isMobile ? "space-y-4" : "grid gap-6 md:grid-cols-2"}>
            <Card>
              <CardHeader className={`pb-3 ${isMobile ? 'px-4 py-4' : ''}`}>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Account Information</CardTitle>
                </div>
                <CardDescription>Your personal information and account details</CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'px-4 py-1' : ''}>
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <AvatarUpload user={user} size={isMobile ? "md" : "lg"} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Name</h4>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Email</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">User ID</h4>
                    <p className="text-sm text-muted-foreground">{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <RoleInfo user={user} />
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsDisplay />
        </TabsContent>

        <TabsContent value="offline" className="mt-6">
          <Card>
            <CardHeader className={isMobile ? 'px-4 py-4' : ''}>
              <CardTitle>Offline Data Management</CardTitle>
              <CardDescription>
                Manage data stored on your device for offline use
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? 'px-4' : ''}>
              <div className="space-y-6">
                <div className={isMobile ? "grid grid-cols-3 gap-2" : "grid grid-cols-3 gap-4"}>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-700">{offlineStats.tasks}</p>
                    <p className="text-sm text-blue-700">Cached Tasks</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-700">{offlineStats.photos}</p>
                    <p className="text-sm text-green-700">Stored Photos</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-700">{offlineStats.forms}</p>
                    <p className="text-sm text-purple-700">Saved Forms</p>
                  </div>
                </div>
                
                <div className={`flex ${isMobile ? 'flex-col' : ''} gap-4`}>
                  <Button 
                    variant="outline" 
                    onClick={handleForceSync}
                    disabled={!navigator.onLine}
                    className={isMobile ? 'mb-2' : ''}
                  >
                    Sync Now
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearOfflineData}
                  >
                    Clear Offline Data
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <h4 className="font-semibold mb-2">About Offline Mode</h4>
                  <p>
                    When offline, you can continue working with cached data. Your changes will be
                    automatically synchronized when you reconnect to the internet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="mt-6">
          {user.role === "superadmin" && <RoleManagement />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
