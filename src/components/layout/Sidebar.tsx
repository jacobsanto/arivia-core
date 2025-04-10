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
  LogOut,
  User,
  Lock,
  Users,
  Shield,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/usePermissions";
import AvatarUpload from "@/components/auth/avatar/AvatarUpload";

const Sidebar = () => {
  const { user, logout } = useUser();
  const { canAccess } = usePermissions();

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;
  
  const isSuperAdmin = user.role === "superadmin";

  return (
    <div className="hidden lg:flex flex-col bg-sidebar text-sidebar-foreground w-64 p-4 shadow-lg">
      <div className="flex items-center justify-center py-6">
        {/* Logo removed from here - now only in Header */}
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mb-2">
            <AvatarUpload user={user} size="sm" editable={false} />
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
          <SidebarLink to="/analytics" icon={<BarChart size={20} />} label="Analytics" />
        )}
        
        {canAccess("viewReports") && (
          <SidebarLink to="/reports" icon={<FileText size={20} />} label="Reports" />
        )}
        
        {isSuperAdmin && (
          <div className="pt-4 border-t border-sidebar-border mt-4">
            <h3 className="px-4 text-xs uppercase font-semibold text-sidebar-muted tracking-wider mb-2">
              Admin Controls
            </h3>
            <SidebarLink 
              to="/admin/users" 
              icon={<Users size={20} />} 
              label="User Management" 
            />
            <SidebarLink 
              to="/admin/permissions" 
              icon={<Shield size={20} />} 
              label="Permissions" 
            />
            <SidebarLink 
              to="/admin/settings" 
              icon={<Settings size={20} />} 
              label="System Settings" 
            />
          </div>
        )}
      </nav>
      
      <div className="pt-4 border-t border-sidebar-border mt-6 space-y-1">
        <SidebarLink to="/profile" icon={<User size={20} />} label="Profile" />
        
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
