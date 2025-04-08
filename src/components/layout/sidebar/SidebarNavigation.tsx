
import React from "react";
import { useLocation } from "react-router-dom";
import SidebarLink from "./SidebarLink";
import { 
  Home, 
  Building2, 
  Briefcase, 
  Wrench, 
  LayoutGrid, 
  MessageSquare, 
  PieChart, 
  FileText,
  Table
} from "lucide-react";
import { User } from "@/types/auth";
import { hasPermission } from "@/services/auth/userAuthService";

interface SidebarNavigationProps {
  user: User;
}

const SidebarNavigation = ({ user }: SidebarNavigationProps) => {
  const location = useLocation();
  
  const isAdmin = hasPermission(user, ["administrator", "superadmin"]);
  const isPropertyRelated = hasPermission(user, ["property_manager", "administrator", "superadmin"]);
  const isMaintenanceRelated = hasPermission(user, ["maintenance_staff", "property_manager", "administrator", "superadmin"]);
  const isHousekeepingRelated = hasPermission(user, ["housekeeping_staff", "property_manager", "administrator", "superadmin"]);
  const isInventoryRelated = hasPermission(user, ["inventory_manager", "property_manager", "administrator", "superadmin"]);
  
  return (
    <div className="space-y-1 py-2 flex-1">
      <SidebarLink to="/" icon={<Home />} active={location.pathname === '/'}>Dashboard</SidebarLink>
      
      {isPropertyRelated && (
        <SidebarLink to="/properties" icon={<Building2 />} active={location.pathname === '/properties'}>Properties</SidebarLink>
      )}
      
      {isHousekeepingRelated && (
        <SidebarLink to="/housekeeping" icon={<Briefcase />} active={location.pathname === '/housekeeping'}>Housekeeping</SidebarLink>
      )}
      
      {isMaintenanceRelated && (
        <SidebarLink to="/maintenance" icon={<Wrench />} active={location.pathname === '/maintenance'}>Maintenance</SidebarLink>
      )}
      
      {isInventoryRelated && (
        <SidebarLink to="/inventory" icon={<LayoutGrid />} active={location.pathname === '/inventory'}>Inventory</SidebarLink>
      )}
      
      <SidebarLink to="/team-chat" icon={<MessageSquare />} active={location.pathname === '/team-chat'}>Team Chat</SidebarLink>
      
      {isAdmin && (
        <>
          <SidebarLink to="/analytics" icon={<PieChart />} active={location.pathname === '/analytics'}>Analytics</SidebarLink>
          <SidebarLink to="/reports" icon={<FileText />} active={location.pathname === '/reports'}>Reports</SidebarLink>
          <SidebarLink to="/google-sheets" icon={<Table />} active={location.pathname === '/google-sheets'}>Google Sheets</SidebarLink>
        </>
      )}
    </div>
  );
};

export default SidebarNavigation;
