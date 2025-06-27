import React from "react";
import { Home, Menu, BedDouble, Package, Wrench, FileWarning } from "lucide-react";
import NavItem from "./NavItem";
import { useUser } from "@/contexts/UserContext";
import { usePermissions } from "@/hooks/usePermissions";

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

const MobileBottomNav = ({ onOpenMenu }: MobileBottomNavProps) => {
  const { user } = useUser();
  const { canAccess } = usePermissions();

  if (!user) return null;

  const isAdmin = user?.role === "superadmin" || user?.role === "tenant_admin";

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-primary text-primary-foreground flex items-center justify-around z-50 lg:hidden shadow-md">
      <NavItem to="/dashboard" icon={<Home size={20} />} label="Home" />

      {(canAccess("viewAllTasks") || canAccess("viewAssignedTasks")) && (
        <NavItem to="/maintenance" icon={<Wrench size={20} />} label="Maintenance" />
      )}

      {canAccess("view_damage_reports") && (
        <NavItem to="/damage-reports" icon={<FileWarning size={20} />} label="Reports" />
      )}

      {(user.role === "inventory_manager" || canAccess("viewInventory")) && (
        <NavItem to="/inventory" icon={<Package size={20} />} label="Inventory" />
      )}

      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1"
        aria-label="Open menu"
      >
        <Menu size={20} />
        <span className="text-xs mt-1">Menu</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;
