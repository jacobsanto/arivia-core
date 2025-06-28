import React from "react";
import { NavLink } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LayoutDashboard, Home, BedDouble, Wrench, Package, MessageSquare, BarChart, FileText, User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/usePermissions";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { canAccess } = usePermissions();

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[250px] p-0 bg-sidebar text-sidebar-foreground">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center py-6">
            <img 
              src="/lovable-uploads/9a31da8a-a1fd-4326-9d13-1d452aa8c0b5.png" 
              alt="Arivia Villas Logo" 
              className="h-12 w-auto" 
            />
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center mb-2">
                <User size={18} className="text-sidebar-accent-foreground" />
              </div>
              <p className="text-sm font-medium">{user.name}</p>
              <span className="text-xs text-sidebar-muted px-2 py-1 bg-sidebar-accent rounded-full mt-1">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            <MobileNavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={onClose} />
            
            {canAccess("viewProperties") && (
              <MobileNavLink to="/properties" icon={<Home size={20} />} label="Properties" onClick={onClose} />
            )}
            
            {(canAccess("viewAllTasks") || canAccess("viewAssignedTasks")) && (
              <>
                <MobileNavLink to="/housekeeping" icon={<BedDouble size={20} />} label="Housekeeping" onClick={onClose} />
                <MobileNavLink to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" onClick={onClose} />
                {(user.role === "administrator" || user.role === "property_manager") && (
                  <MobileNavLink to="/damage-reports" icon={<FileText size={20} />} label="Damage Reports" onClick={onClose} />
                )}
              </>
            )}
            
            {(user.role === "maintenance_staff" || canAccess("manageProperties")) && (
              <MobileNavLink to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" onClick={onClose} />
            )}
            
            {(user.role === "inventory_manager" || canAccess("viewInventory")) && (
              <MobileNavLink to="/inventory" icon={<Package size={20} />} label="Inventory" onClick={onClose} />
            )}
            
            <MobileNavLink to="/team-chat" icon={<MessageSquare size={20} />} label="Team Chat" onClick={onClose} />
            
            {canAccess("viewReports") && (
              <MobileNavLink to="/analytics" icon={<BarChart size={20} />} label="Analytics" onClick={onClose} />
            )}
            
            {canAccess("viewReports") && (
              <MobileNavLink to="/reports" icon={<FileText size={20} />} label="Reports" onClick={onClose} />
            )}
            
            <MobileNavLink to="/profile" icon={<User size={20} />} label="Profile" onClick={onClose} />
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface MobileNavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const MobileNavLink = ({ to, icon, label, onClick }: MobileNavLinkProps) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-2.5 rounded-md font-medium transition-colors ${
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

export default MobileNavigation;
