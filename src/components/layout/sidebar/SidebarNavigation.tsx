
import React from "react";
import { useLocation } from "react-router-dom";
import { LayoutGrid, CalendarRange, ClipboardList, Hammer, LineChart, BarChart3, MessageSquare, FileText, BoxSelect, Truck, HelpCircle, FileSpreadsheet } from "lucide-react";
import SidebarLink from "./SidebarLink";
import { useUser } from "@/contexts/auth/UserContext";
import { User } from "@/types/auth";

// Add an interface for component props
interface SidebarNavigationProps {
  user: User;
}

const SidebarNavigation = ({ user }: SidebarNavigationProps) => {
  const location = useLocation();
  
  // Check if the current route matches the given path
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="flex flex-col py-2 space-y-1">
      <SidebarLink 
        to="/" 
        icon={<LayoutGrid size={20} />} 
        active={isActive("/")}
      >
        Dashboard
      </SidebarLink>
      
      {(user.role === "administrator" || user.role === "property_manager" || user.role === "superadmin") && (
        <SidebarLink 
          to="/properties" 
          icon={<CalendarRange size={20} />} 
          active={isActive("/properties")}
        >
          Properties
        </SidebarLink>
      )}
      
      {(user.role === "administrator" || user.role === "property_manager" || user.role === "housekeeping_staff" || user.role === "maintenance_staff" || user.role === "superadmin") && (
        <SidebarLink 
          to="/housekeeping" 
          icon={<ClipboardList size={20} />} 
          active={isActive("/housekeeping")}
        >
          Housekeeping
        </SidebarLink>
      )}
      
      {(user.role === "administrator" || user.role === "property_manager" || user.role === "maintenance_staff" || user.role === "superadmin") && (
        <SidebarLink 
          to="/maintenance" 
          icon={<Hammer size={20} />} 
          active={isActive("/maintenance")}
        >
          Maintenance
        </SidebarLink>
      )}
      
      {(user.role === "administrator" || user.role === "property_manager" || user.role === "inventory_manager" || user.role === "superadmin") && (
        <SidebarLink 
          to="/inventory" 
          icon={<BoxSelect size={20} />} 
          active={isActive("/inventory")}
        >
          Inventory
        </SidebarLink>
      )}
      
      {(user.role === "administrator" || user.role === "property_manager" || user.role === "superadmin") && (
        <>
          <SidebarLink 
            to="/analytics" 
            icon={<LineChart size={20} />} 
            active={isActive("/analytics")}
          >
            Analytics
          </SidebarLink>
          
          <SidebarLink 
            to="/reports" 
            icon={<BarChart3 size={20} />} 
            active={isActive("/reports")}
          >
            Reports
          </SidebarLink>

          <SidebarLink 
            to="/google-sheets" 
            icon={<FileSpreadsheet size={20} />} 
            active={isActive("/google-sheets")}
          >
            Google Sheets
          </SidebarLink>
        </>
      )}
      
      <SidebarLink 
        to="/team-chat" 
        icon={<MessageSquare size={20} />} 
        active={isActive("/team-chat")}
      >
        Team Chat
      </SidebarLink>
      
      <SidebarLink 
        to="/troubleshooting" 
        icon={<HelpCircle size={20} />} 
        active={isActive("/troubleshooting")}
      >
        Help
      </SidebarLink>
    </div>
  );
};

export default SidebarNavigation;
