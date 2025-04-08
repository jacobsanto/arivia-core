
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  BedDouble,
  Wrench,
  Package,
  MessageSquare,
  BarChart,
  FileText,
  Settings,
  LogOut,
  User,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/auth/UserContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { ROLE_DETAILS } from "@/types/auth"; // Import ROLE_DETAILS directly

const Sidebar = () => {
  const { user, logout, unreadNotifications } = useUser();
  const { canAccess } = usePermissions();

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  // Determine if user account is pending approval
  const isPending = user.pendingApproval === true;

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
      
      <div className="flex items-center justify-center mb-6">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-sidebar-accent flex items-center justify-center mb-2">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
            ) : (
              <User size={20} className="text-sidebar-accent-foreground" />
            )}
          </div>
          <p className="text-sm font-medium">{user.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-sidebar-muted px-2 py-1 bg-sidebar-accent rounded-full">
              {ROLE_DETAILS[user.role]?.title || user.role.replace('_', ' ')}
            </span>
            {isPending && (
              <span className="text-xs text-amber-800 px-2 py-1 bg-amber-100 rounded-full">
                Pending
              </span>
            )}
          </div>
        </div>
      </div>
      
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
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  badge?: string;
}

const SidebarLink = ({ to, icon, label, disabled = false, badge }: SidebarLinkProps) => {
  if (disabled) {
    return (
      <div className="flex items-center px-4 py-2 rounded-md font-medium text-sidebar-muted opacity-50 cursor-not-allowed">
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
        <Lock size={14} className="ml-auto" />
      </div>
    );
  }
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-2 rounded-md font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
      {badge && (
        <Badge variant="destructive" className="ml-auto text-xs">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

// Import ROLE_DETAILS to properly display role names
const { ROLE_DETAILS } = require("@/types/auth");

export default Sidebar;
