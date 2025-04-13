
import React from "react";
import { NavLink } from "react-router-dom";

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
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex flex-col items-center justify-center py-2 hover:bg-sidebar-accent/50 transition-colors ${
          isActive ? "text-sidebar-primary" : "text-sidebar-foreground"
        }`
      }
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
};

export default NavItem;
