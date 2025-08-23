/**
 * Refactored AdminSettings page - broken down into focused components
 */
import React from "react";
import { Helmet } from "react-helmet-async";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingState } from "@/components/common/loading/LoadingSpinner";
import { ResponsiveContainer } from "@/components/ui/mobile/mobile-responsive";
import { AdminSettingsHeader } from "./admin-settings/AdminSettingsHeader";
import { AdminSettingsContent } from "./admin-settings/AdminSettingsContent";
import { useAdminAccess } from "./admin-settings/hooks/useAdminAccess";
import { useSwipeNavigation } from "./admin-settings/hooks/useSwipeNavigation";

const AdminSettingsPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isElevated, isLoading } = useAdminAccess(user);
  const swipeHandlers = useSwipeNavigation(navigate);
  
  // Show loading state while checking access
  if (isLoading) {
    return <LoadingState loading={true} children={null} />;
  }
  
  // Access denied
  if (!isElevated) {
    React.useEffect(() => {
      toast.error("Access denied", {
        description: "You need elevated privileges to access this area"
      });
      navigate("/");
    }, [navigate]);
    return null;
  }
  
  return (
    <ResponsiveContainer {...swipeHandlers}>
      <Helmet>
        <title>System Settings - Arivia Villa Sync</title>
      </Helmet>
      
      <div className="space-y-6 max-w-full min-w-0">
        <AdminSettingsHeader />
        <AdminSettingsContent />
      </div>
    </ResponsiveContainer>
  );
};

export default AdminSettingsPage;