
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Home, BedDouble, Wrench, Package, MessageSquare, BarChart, FileText, LogOut, User, Users, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import AvatarUpload from "@/components/auth/AvatarUpload";
interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose
}) => {
  const {
    user,
    logout
  } = useUser();
  const {
    canAccess
  } = usePermissions();
  if (!user) return null;
  const isSuperAdmin = user.role === "superadmin";
  const handleLogout = () => {
    logout();
    onClose();
  };

  // Close the mobile sidebar when a link is clicked
  const handleLinkClick = () => {
    onClose();
  };
  return <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] p-0 bg-blue-950">
        <SheetHeader className="p-4 border-b text-left">
          <SheetTitle className="flex justify-center">
            <img src="/lovable-uploads/9a31da8a-a1fd-4326-9d13-1d452aa8c0b5.png" alt="Arivia Villas Logo" className="h-10 w-auto" />
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex items-center justify-center py-6 border-b">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
              <AvatarUpload user={user} editable={false} />
            </div>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full mt-1">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="py-2">
          <nav className="space-y-1 px-2">
            <MobileSidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={handleLinkClick} />
            
            {canAccess("viewProperties") && <MobileSidebarLink to="/properties" icon={<Home size={20} />} label="Properties" onClick={handleLinkClick} />}
            
            {(canAccess("viewAllTasks") || canAccess("viewAssignedTasks")) && <MobileSidebarLink to="/housekeeping" icon={<BedDouble size={20} />} label="Housekeeping" onClick={handleLinkClick} />}
            
            {(user.role === "maintenance_staff" || canAccess("manageProperties")) && <MobileSidebarLink to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" onClick={handleLinkClick} />}
            
            {(user.role === "inventory_manager" || canAccess("viewInventory")) && <MobileSidebarLink to="/inventory" icon={<Package size={20} />} label="Inventory" onClick={handleLinkClick} />}
            
            <MobileSidebarLink to="/team-chat" icon={<MessageSquare size={20} />} label="Team Chat" onClick={handleLinkClick} />
            
            {canAccess("viewReports") && <MobileSidebarLink to="/analytics" icon={<BarChart size={20} />} label="Analytics" onClick={handleLinkClick} />}
            
            {canAccess("viewReports") && <MobileSidebarLink to="/reports" icon={<FileText size={20} />} label="Reports" onClick={handleLinkClick} />}
            
            {/* Admin section for superadmins */}
            {isSuperAdmin && <div className="pt-2 mt-2 border-t">
                <h3 className="px-3 text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">
                  Admin Controls
                </h3>
                <MobileSidebarLink to="/admin/users" icon={<Users size={20} />} label="User Management" onClick={handleLinkClick} />
                <MobileSidebarLink to="/admin/permissions" icon={<Shield size={20} />} label="Permissions" onClick={handleLinkClick} />
                <MobileSidebarLink to="/admin/settings" icon={<Settings size={20} />} label="System Settings" onClick={handleLinkClick} />
              </div>}
            
            <div className="pt-2 mt-2 border-t">
              <MobileSidebarLink to="/profile" icon={<User size={20} />} label="Profile" onClick={handleLinkClick} />
              
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <LogOut className="mr-3 h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>;
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
  }) => cn("flex items-center px-3 py-2 rounded-md font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")} onClick={onClick}>
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>;
};
export default MobileSidebar;
