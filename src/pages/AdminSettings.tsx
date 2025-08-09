
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useSwipe } from "@/hooks/use-swipe";
import SystemSettingsTabs from "@/components/settings/SystemSettingsTabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import OfflineIndicator from "@/components/layout/OfflineIndicator";

const AdminSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  
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

  // Filter settings function - in a real app, this would be more sophisticated
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    
    // In a real app, you would implement logic to filter/highlight matched settings
    // For now, we'll just show a toast when someone searches
    if (e.target.value.length > 2) {
      toast.info("Search feature", {
        description: `Searching for "${e.target.value}" in settings`
      });
    }
  };
  
  return (
    <div {...gestureProps} className="max-w-full">
      <Helmet>
        <title>System Settings - Arivia Villa Sync</title>
      </Helmet>
      
      <div className="space-y-6 max-w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
          
          <div className="flex items-center w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search settings..."
                className="pl-8 pr-4"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        
        <div className="max-w-full">
          <OfflineIndicator />
        </div>
        
        <div className="max-w-full">
          <SystemSettingsTabs />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
