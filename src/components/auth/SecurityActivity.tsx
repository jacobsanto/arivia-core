
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, Clock, LogIn, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { checkOfflineLoginStatus } from "@/services/auth/offlineService";

const SecurityActivity = () => {
  const { user } = useAuth();
  
  const handleTwoFactorToggle = (checked: boolean) => {
    // This would connect to the backend to enable/disable 2FA in a real app
    toast.info(checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
  };
  
  // Get last auth/login time from localStorage or default to unknown
  const lastAuthTime = Number(localStorage.getItem("lastAuthTime") || "0");
  const lastLoginTime = localStorage.getItem("lastAuthTime") 
    ? new Date(parseInt(localStorage.getItem("lastAuthTime") || "0")).toLocaleString()
    : "Unknown";
  
  // Determine if offline login is allowed for this user
  const allowOfflineLogin = checkOfflineLoginStatus(user, lastAuthTime, !navigator.onLine);
  
  // For device info, we'll get some basic browser information
  const deviceInfo = {
    browser: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Security & Activity
        </CardTitle>
        <CardDescription>
          Review your account security settings and recent activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Settings */}
        <div>
          <h3 className="text-sm font-medium mb-3">Security Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch onCheckedChange={handleTwoFactorToggle} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Offline Access</p>
                <p className="text-sm text-muted-foreground">
                  Allow access when device is offline
                </p>
              </div>
              <Badge variant={allowOfflineLogin ? "default" : "outline"}>
                {allowOfflineLogin ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Login Activity */}
        <div>
          <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
          <div className="space-y-4">
            <div className="bg-secondary/40 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <LogIn className="h-4 w-4 text-green-600" />
                <span className="font-medium">Last Login</span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastLoginTime}
              </p>
            </div>
            
            <div className="bg-secondary/40 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Current Device</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {deviceInfo.browser}
              </p>
              <p className="text-sm text-muted-foreground">
                {deviceInfo.platform} ({deviceInfo.language})
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityActivity;
