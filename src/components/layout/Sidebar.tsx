import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Home, BedDouble, Wrench, Package, MessageSquare, BarChart, FileWarning, LogOut, User, Users, Shield, Settings, CheckSquare, Camera, Monitor, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/usePermissions";
import AvatarDisplay from "@/components/auth/avatar/AvatarDisplay";
const Sidebar = () => {
  const {
    user,
    logout
  } = useUser();
  const {
    canAccess
  } = usePermissions();
  const handleLogout = () => {
    logout();
  };
  if (!user) return null;
  const isSuperAdmin = user.role === "superadmin";
  const isAdmin = user.role === "administrator";
  const isPropertyManager = user.role === "property_manager";
  return <div className="hidden lg:flex flex-col bg-sidebar text-sidebar-foreground w-64 p-4 shadow-lg">
      
      
      <div className="flex items-center justify-center mb-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
            <AvatarDisplay user={user} size="md" />
          </div>
          <p className="font-semibold text-base">{user.name}</p>
          <span className="text-sidebar-muted px-2 py-1 bg-sidebar-accent rounded-full mt-1 font-semibold text-sm">
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <nav className="mt-6 flex-1 space-y-1">
        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        
        {canAccess("viewProperties") && <SidebarLink to="/properties" icon={<Home size={20} />} label="Properties" />}
        
        {(canAccess("viewAllTasks") || canAccess("viewAssignedTasks")) && <>
            <SidebarLink to="/housekeeping" icon={<BedDouble size={20} />} label="Housekeeping" />
            <SidebarLink to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" />
          </>}
        
        {canAccess("view_damage_reports") && <SidebarLink to="/damage-reports" icon={<FileWarning size={20} />} label="Damage Reports" />}
        
        {(user.role === "inventory_manager" || canAccess("viewInventory")) && <SidebarLink to="/inventory" icon={<Package size={20} />} label="Inventory" />}
        
        <SidebarLink to="/team-chat" icon={<MessageSquare size={20} />} label="Team Chat" />
        
        <SidebarLink to="/virtual-tours" icon={<Camera size={20} />} label="3D Virtual Tours" />
        
        {canAccess("viewReports") && <>
            <SidebarLink to="/reports" icon={<FileWarning size={20} />} label="Reports" />
            <SidebarLink to="/analytics" icon={<BarChart size={20} />} label="Analytics" />
          </>}
        
        {(isSuperAdmin || isAdmin) && <div className="pt-4 border-t border-sidebar-border mt-4">
            <h3 className="px-4 text-xs uppercase font-semibold text-sidebar-muted tracking-wider mb-2">
              Admin Controls
            </h3>
            <SidebarLink to="/admin/users" icon={<Users size={20} />} label="User Management" />
            <SidebarLink to="/admin/permissions" icon={<Shield size={20} />} label="Permissions" />
            <SidebarLink to="/admin/checklists" icon={<CheckSquare size={20} />} label="Checklists" />
            <SidebarLink to="/system-admin" icon={<Monitor size={20} />} label="System Admin" />
            <SidebarLink to="/optimization" icon={<Zap size={20} />} label="Optimization" />
            <SidebarLink to="/admin/settings" icon={<Settings size={20} />} label="System Settings" />
          </div>}
      </nav>
      
      <div className="pt-4 border-t border-sidebar-border mt-6 space-y-1">
        <SidebarLink to="/profile" icon={<User size={20} />} label="Profile" />
        
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>;
};
interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}
const SidebarLink = ({
  to,
  icon,
  label,
  disabled = false
}: SidebarLinkProps) => {
  if (disabled) {
    return <div className="flex items-center px-4 py-2 rounded-md font-medium text-sidebar-muted opacity-50 cursor-not-allowed">
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </div>;
  }
  return <NavLink to={to} className={({
    isActive
  }) => cn("flex items-center px-4 py-2 rounded-md font-medium transition-colors", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
      <span className="mr-3">{icon}</span>
      <span className="font-normal text-base">{label}</span>
    </NavLink>;
};
export default Sidebar;