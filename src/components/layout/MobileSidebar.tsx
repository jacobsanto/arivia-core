

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Home, BedDouble, Wrench, Package, MessageSquare, BarChart, FileWarning, LogOut, User, Users, Shield, Settings, CheckSquare, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import AvatarDisplay from "@/components/auth/avatar/AvatarDisplay";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const { canAccess } = usePermissions();

  if (!user) return null;

  const isSuperAdmin = user.role === "superadmin";
  const isAdmin = user.role === "administrator";
  const isPropertyManager = user.role === "property_manager";

  const handleLogout = () => {
    signOut();
    onClose();
  };
  const handleLinkClick = () => {
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar text-sidebar-foreground">
        <SheetHeader className="p-4 border-b border-sidebar-border text-left">
          <SheetTitle className="flex justify-center">
            <img src="/lovable-uploads/9a31da8a-a1fd-4326-9d13-1d452aa8c0b5.png" alt="Arivia Villas Logo" className="h-14 w-auto" />
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex items-center justify-center py-6 border-b border-sidebar-border">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
              <AvatarDisplay user={user} size="md" />
            </div>
            <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <span className="text-xs px-2 py-1 bg-sidebar-accent rounded-full mt-1 text-sidebar-accent-foreground">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="py-2">
          <nav className="space-y-1 px-2">
            <MobileSidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={handleLinkClick} />
            
            {canAccess("viewProperties") && <MobileSidebarLink to="/properties" icon={<Home size={20} />} label="Properties" onClick={handleLinkClick} />}
            
            {(canAccess("viewAllTasks") || canAccess("viewAssignedTasks")) && (
              <>
                <MobileSidebarLink to="/housekeeping" icon={<BedDouble size={20} />} label="Housekeeping" onClick={handleLinkClick} />
                <MobileSidebarLink to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" onClick={handleLinkClick} />
              </>
            )}
            
            {/* Updated to use the new permission */}
            {canAccess("view_damage_reports") && (
              <MobileSidebarLink to="/damage-reports" icon={<FileWarning size={20} />} label="Damage Reports" onClick={handleLinkClick} />
            )}
            
            {(user.role === "inventory_manager" || canAccess("viewInventory")) && (
              <MobileSidebarLink to="/inventory" icon={<Package size={20} />} label="Inventory" onClick={handleLinkClick} />
            )}
            
            <MobileSidebarLink to="/team-chat" icon={<MessageSquare size={20} />} label="Team Chat" onClick={handleLinkClick} />
            
            {canAccess("viewReports") && <>
              <MobileSidebarLink to="/analytics" icon={<BarChart size={20} />} label="Analytics" onClick={handleLinkClick} />
              <MobileSidebarLink to="/finance" icon={<DollarSign size={20} />} label="Finance" onClick={handleLinkClick} />
            </>}
            
            {isSuperAdmin && (
              <div className="pt-2 mt-2 border-t border-sidebar-border">
                <h3 className="px-3 text-xs uppercase font-semibold text-sidebar-muted tracking-wider mb-2">
                  Admin Controls
                </h3>
                <MobileSidebarLink to="/admin/users" icon={<Users size={20} />} label="User Management" onClick={handleLinkClick} />
                <MobileSidebarLink to="/admin/permissions" icon={<Shield size={20} />} label="Permissions" onClick={handleLinkClick} />
                <MobileSidebarLink to="/admin/checklists" icon={<CheckSquare size={20} />} label="Checklists" onClick={handleLinkClick} />
                <MobileSidebarLink to="/admin/settings" icon={<Settings size={20} />} label="System Settings" onClick={handleLinkClick} />
              </div>
            )}
            
            <div className="pt-2 mt-2 border-t border-sidebar-border">
              <MobileSidebarLink to="/profile" icon={<User size={20} />} label="Profile" onClick={handleLinkClick} />
              
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="mr-3 h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface MobileSidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const MobileSidebarLink: React.FC<MobileSidebarLinkProps> = ({
  to,
  icon,
  label,
  onClick
}) => {
  return <NavLink to={to} className={({
    isActive
  }) => cn("flex items-center px-3 py-2 rounded-md font-medium transition-colors", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")} onClick={onClick}>
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>;
};

export default MobileSidebar;

