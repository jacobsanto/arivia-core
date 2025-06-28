
import React, { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import RoleManagement from "@/components/auth/RoleManagement";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger, SwipeableTabsProvider } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSwipe } from "@/hooks/use-swipe";

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("users");
  const tabsRef = useRef(null);
  
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
        <title>User Management - Arivia Villa Sync</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isMobile && <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-1 px-0 mx-0 py-0 my-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>}
            <div>
              <h1 className="md:text-3xl font-bold tracking-tight flex items-center text-xl px-0 mx-0 text-left">
                <Users className="mr-2 h-7 w-7" /> User Management
              </h1>
              <p className="text-sm text-muted-foreground tracking-tight py-0 px-0 mx-0">
                Manage users, roles, and permissions
              </p>
            </div>
          </div>
        </div>
        
        <SwipeableTabsProvider>
          <Tabs ref={tabsRef} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full scroll-tabs">
              <TabsTrigger value="users">Users & Roles</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="mt-6" tabsRoot={tabsRef}>
              <RoleManagement />
            </TabsContent>
          </Tabs>
        </SwipeableTabsProvider>
      </div>
    </div>
  );
};

export default AdminUsers;
