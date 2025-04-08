
import React from "react";
import { 
  LayoutDashboard, 
  Home, 
  BedDouble, 
  Wrench, 
  Package, 
  MessageSquare, 
  BarChart, 
  FileText,
  User 
} from "lucide-react";
import { User as UserType } from "@/types/auth";
import SidebarLink from "./SidebarLink";
import { usePermissions } from "@/hooks/usePermissions";

interface SidebarNavigationProps {
  user: UserType;
}

const SidebarNavigation = ({ user }: SidebarNavigationProps) => {
  const { canAccess } = usePermissions();
  const isPending = user.pendingApproval === true;
  
  return (
    <nav className="mt-6 flex-1 space-y-1">
      <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
      
      {/* Show disabled links for pending users */}
      {isPending ? (
        <>
          <SidebarLink 
            to="/properties" 
            icon={<Home size={20} />} 
            label="Properties" 
            disabled={true}
          />
          <SidebarLink 
            to="/housekeeping" 
            icon={<BedDouble size={20} />} 
            label="Housekeeping" 
            disabled={true}
          />
          <SidebarLink 
            to="/maintenance" 
            icon={<Wrench size={20} />} 
            label="Maintenance" 
            disabled={true}
          />
          <SidebarLink 
            to="/inventory" 
            icon={<Package size={20} />} 
            label="Inventory" 
            disabled={true}
          />
          <SidebarLink 
            to="/team-chat" 
            icon={<MessageSquare size={20} />} 
            label="Team Chat" 
            disabled={true}
          />
          <SidebarLink 
            to="/analytics" 
            icon={<BarChart size={20} />} 
            label="Analytics" 
            disabled={true}
          />
          <SidebarLink 
            to="/reports" 
            icon={<FileText size={20} />} 
            label="Reports" 
            disabled={true}
          />
        </>
      ) : (
        <>
          {canAccess("viewProperties") && (
            <SidebarLink to="/properties" icon={<Home size={20} />} label="Properties" />
          )}
          
          {(canAccess("viewAllTasks") || canAccess("viewAssignedTasks")) && (
            <SidebarLink to="/housekeeping" icon={<BedDouble size={20} />} label="Housekeeping" />
          )}
          
          {(user.role === "maintenance_staff" || canAccess("manageProperties")) && (
            <SidebarLink to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" />
          )}
          
          {(user.role === "inventory_manager" || canAccess("viewInventory")) && (
            <SidebarLink to="/inventory" icon={<Package size={20} />} label="Inventory" />
          )}
          
          <SidebarLink to="/team-chat" icon={<MessageSquare size={20} />} label="Team Chat" />
          
          {canAccess("viewReports") && (
            <SidebarLink to="/analytics" icon={<BarChart size={20} />} label="Analytics" />
          )}
          
          {canAccess("viewReports") && (
            <SidebarLink to="/reports" icon={<FileText size={20} />} label="Reports" />
          )}
        </>
      )}
      
      <SidebarLink to="/profile" icon={<User size={20} />} label="Profile" />
    </nav>
  );
};

export default SidebarNavigation;
