
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
  Settings,
  LogOut,
  User,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/usePermissions";

const Sidebar = () => {
  const { user, logout } = useUser();
  const { canAccess } = usePermissions();

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <div className="hidden lg:flex flex-col bg-sidebar text-sidebar-foreground w-64 p-4 shadow-lg">
      <div className="flex items-center justify-center py-6">
        {/* Logo goes here */}
        <img 
          src="/Secondary-Logo.png" 
          alt="Arivia Villas Logo" 
          className="h-10 w-auto" 
        />
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-sidebar-accent flex items-center justify-center mb-2">
            <User size={20} className="text-sidebar-accent-foreground" />
          </div>
          <p className="text-sm font-medium">{user.name}</p>
          <span className="text-xs text-sidebar-muted px-2 py-1 bg-sidebar-accent rounded-full mt-1">
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <nav className="mt-6 flex-1 space-y-1">
        <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        
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
          <SidebarLink to="/reports" icon={<BarChart size={20} />} label="Reports" />
        )}
        
        <SidebarLink to="/profile" icon={<User size={20} />} label="Profile" />
      </nav>
      
      <div className="pt-4 border-t border-sidebar-border mt-6">
        {(user.role === "administrator" || user.role === "superadmin") && (
          <SidebarLink to="/settings" icon={<Settings size={20} />} label="Settings" />
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
}

const SidebarLink = ({ to, icon, label, disabled = false }: SidebarLinkProps) => {
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
    </NavLink>
  );
};

export default Sidebar;
