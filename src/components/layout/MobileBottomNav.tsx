import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BedDouble, Package, MessageSquare, Menu, Wrench } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
interface MobileBottomNavProps {
  onOpenMenu: () => void;
}
const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenMenu
}) => {
  const {
    canAccess
  } = usePermissions();
  return <div className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-40 pb-safe my-0 py-[10px]">
      <div className="grid grid-flow-col auto-cols-fr">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Home" />
        
        {canAccess("viewAllTasks") && <NavItem to="/housekeeping" icon={<BedDouble size={20} />} label="Tasks" />}
        
        {canAccess("viewMaintenanceTasks") && <NavItem to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" />}
        
        {canAccess("viewInventory") && <NavItem to="/inventory" icon={<Package size={20} />} label="Items" />}
        
        <NavItem to="/team-chat" icon={<MessageSquare size={20} />} label="Chat" />
        
        <button onClick={onOpenMenu} className="flex flex-col items-center justify-center py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
          <Menu size={20} />
          <span className="hidden text-xs mt-1">Menu</span>
        </button>
      </div>
    </div>;
};
interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}
const NavItem = ({
  to,
  icon,
  label
}: NavItemProps) => {
  return <NavLink to={to} className={({
    isActive
  }) => `flex flex-col items-center justify-center py-2 hover:bg-sidebar-accent/50 transition-colors ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground"}`}>
      {icon}
      <span className="hidden text-xs mt-1">{label}</span>
    </NavLink>;
};
export default MobileBottomNav;