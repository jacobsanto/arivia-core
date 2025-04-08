
import React from "react";
import { useUser } from "@/contexts/auth/UserContext";
import SidebarUserInfo from "./sidebar/SidebarUserInfo";
import SidebarNavigation from "./sidebar/SidebarNavigation";
import SidebarFooter from "./sidebar/SidebarFooter";

const Sidebar = () => {
  const { user, logout, unreadNotifications } = useUser();

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <div className="hidden lg:flex flex-col bg-sidebar text-sidebar-foreground w-64 p-4 shadow-lg">
      <div className="flex items-center justify-center py-6">
        {/* Updated logo */}
        <img 
          src="/lovable-uploads/9a31da8a-a1fd-4326-9d13-1d452aa8c0b5.png" 
          alt="Arivia Villas Logo" 
          className="h-14 w-auto" 
        />
      </div>
      
      <SidebarUserInfo user={user} />
      <SidebarNavigation user={user} />
      <SidebarFooter 
        user={user} 
        unreadNotifications={unreadNotifications} 
        onLogout={handleLogout} 
      />
    </div>
  );
};

export default Sidebar;
