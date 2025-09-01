import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Home, BedDouble, Wrench, Package, MessageSquare, 
  FileWarning, LogOut, User, Users, Shield, Settings, CheckSquare, 
  Monitor, Zap, BarChart3, FileText, ChevronDown, ChevronRight,
  Clock, Repeat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/usePermissions";
import AvatarDisplay from "@/components/auth/avatar/AvatarDisplay";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
const Sidebar = () => {
  const { user, logout } = useUser();
  const { canAccess } = usePermissions();
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(true);
  const [administrationOpen, setAdministrationOpen] = useState(true);
  
  const handleLogout = () => {
    logout();
  };
  
  if (!user) return null;
  
  const isSuperAdmin = user.role === "superadmin";
  const isAdmin = user.role === "administrator";
  const isPropertyManager = user.role === "property_manager";
  return <div className="hidden md:flex flex-col bg-sidebar text-sidebar-foreground w-64 p-4 shadow-lg border-r border-sidebar-border" style={{ boxShadow: 'var(--shadow-border)' }}>
      {/* User Profile Section */}
      <div className="flex items-center justify-center mb-6 my-[10px] py-0">
        <div className="flex flex-col items-center">
          <p className="font-semibold text-base text-justify">{user.name}</p>
          <span className="text-sidebar-muted px-2 py-1 bg-sidebar-accent rounded-full mt-1 font-semibold text-sm">
            {user.role.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <nav className="mt-6 flex-1 space-y-2">
        {/* OPERATIONS - The Daily Hub */}
        <Collapsible open={operationsOpen} onOpenChange={setOperationsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-sidebar-muted hover:text-sidebar-foreground transition-colors">
            <span className="text-xs uppercase font-semibold tracking-wider">Operations</span>
            {operationsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            {canAccess("viewProperties") && <SidebarLink to="/properties" icon={<Home size={20} />} label="Properties" />}
            {(canAccess("viewAllTasks") || canAccess("viewAssignedTasks")) && (
              <>
                <SidebarLink to="/housekeeping" icon={<BedDouble size={20} />} label="Housekeeping" />
                <SidebarLink to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" />
              </>
            )}
            <SidebarLink to="/team-chat" icon={<MessageSquare size={20} />} label="Team Chat" />
          </CollapsibleContent>
        </Collapsible>

        {/* MANAGEMENT - The Strategic Overview */}
        <Collapsible open={managementOpen} onOpenChange={setManagementOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-sidebar-muted hover:text-sidebar-foreground transition-colors">
            <span className="text-xs uppercase font-semibold tracking-wider">Management</span>
            {managementOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {canAccess("view_damage_reports") && <SidebarLink to="/damage-reports" icon={<FileWarning size={20} />} label="Damage Reports" />}
            {(user.role === "inventory_manager" || canAccess("viewInventory")) && <SidebarLink to="/inventory" icon={<Package size={20} />} label="Inventory" />}
            {canAccess("viewReports") && <SidebarLink to="/reports" icon={<FileText size={20} />} label="Reports" />}
            {canAccess("viewReports") && <SidebarLink to="/cleaning-settings" icon={<Settings size={20} />} label="Cleaning Settings" />}
            {canAccess("viewReports") && <SidebarLink to="/recurring-tasks" icon={<Repeat size={20} />} label="Recurring Tasks" />}
          </CollapsibleContent>
        </Collapsible>

        {/* ADMINISTRATION - The Control Panel */}
        {(isSuperAdmin || isAdmin || isPropertyManager) && (
          <Collapsible open={administrationOpen} onOpenChange={setAdministrationOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 text-sidebar-muted hover:text-sidebar-foreground transition-colors">
              <span className="text-xs uppercase font-semibold tracking-wider">Administration</span>
              {administrationOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {canAccess("viewReports") && <SidebarLink to="/analytics" icon={<BarChart3 size={20} />} label="Analytics" />}
              {(isSuperAdmin || isAdmin) && <SidebarLink to="/checklists" icon={<CheckSquare size={20} />} label="Checklists" />}
              {(isSuperAdmin || isAdmin) && <SidebarLink to="/admin/users" icon={<Users size={20} />} label="User Management" />}
              {(isSuperAdmin || isAdmin) && <SidebarLink to="/admin/permissions" icon={<Shield size={20} />} label="Permissions" />}
              {(isSuperAdmin || isAdmin) && <SidebarLink to="/system-admin" icon={<Monitor size={20} />} label="System Admin" />}
              {(isSuperAdmin || isAdmin) && <SidebarLink to="/admin/settings" icon={<Settings size={20} />} label="System Settings" />}
              {isSuperAdmin && <SidebarLink to="/optimization" icon={<Zap size={20} />} label="Optimization" />}
            </CollapsibleContent>
          </Collapsible>
        )}
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