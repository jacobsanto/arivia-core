
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useSwipe } from "@/hooks/use-swipe";
import SystemSettingsTabs from "@/components/settings/SystemSettingsTabs";

const AdminSettings = () => {
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
    // Redirect non-superadmins away
    React.useEffect(() => {
      toast.error("Access denied", {
        description: "You need superadmin privileges to access this area"
      });
      navigate("/");
    }, [navigate]);
    return null;
  }
  
  const gestureProps = isMobile ? {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } : {};
  
  return (
    <div {...gestureProps}>
      <Helmet>
        <title>System Settings - Arivia Villa Sync</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isMobile && <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>}
            <div>
              <h1 className="md:text-3xl font-bold tracking-tight flex items-center text-xl px-px">
                <Settings className="mr-2 h-7 w-7" /> System Settings
              </h1>
              <p className="text-sm text-muted-foreground tracking-tight px-0 mx-0">
                Configure global system settings
              </p>
            </div>
          </div>
        </div>
        
        <SystemSettingsTabs />
      </div>
    </div>
  );
};

export default AdminSettings;
