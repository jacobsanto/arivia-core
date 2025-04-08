
import React from "react";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarLink from "./SidebarLink";
import { User } from "@/types/auth";

interface SidebarFooterProps {
  user: User;
  unreadNotifications: number;
  onLogout: () => void;
}

const SidebarFooter = ({ user, unreadNotifications, onLogout }: SidebarFooterProps) => {
  return (
    <div className="pt-4 border-t border-sidebar-border mt-6">
      {(user.role === "administrator" || user.role === "superadmin") && (
        <SidebarLink 
          to="/settings" 
          icon={<Settings size={20} />} 
          label="Settings" 
          badge={unreadNotifications > 0 ? unreadNotifications.toString() : undefined}
        />
      )}
      
      <Button 
        variant="ghost" 
        onClick={onLogout}
        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <LogOut className="mr-3 h-5 w-5" />
        <span>Logout</span>
      </Button>
    </div>
  );
};

export default SidebarFooter;
