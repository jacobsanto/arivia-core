
import React from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RestrictedAccess from "@/components/layout/RestrictedAccess";
import { useUser } from "@/contexts/auth/UserContext";

const Dashboard = () => {
  const { user } = useUser();
  
  // If user is a guest with pending approval, show restricted access view
  if (user?.role === "guest" && user?.pendingApproval) {
    return <RestrictedAccess />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <DashboardHeader />
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
