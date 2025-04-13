
import React from "react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children?: React.ReactNode;  // Changed from 'label' to 'children'
  label?: string; // Keep label as optional for backward compatibility
}

const NavItem = ({
  to,
  icon,
  children,
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
      <span className="hidden text-xs mt-1">{children || label}</span>
    </NavLink>
  );
};

export default NavItem;
