
import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import OfflineIndicator from "./OfflineIndicator";
import { useUser } from "@/contexts/auth/UserContext";
import { Outlet } from "react-router-dom";

// Create a simple toggleSidebar function that will be passed to children
const AppLayout = () => {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {user && <Header toggleSidebar={toggleSidebar} />}
        <OfflineIndicator />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
        {user && <MobileNav />}
      </div>
    </div>
  );
};

export default AppLayout;
