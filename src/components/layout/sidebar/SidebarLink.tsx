
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}

const SidebarLink = ({ to, icon, children, active, disabled = false, badge }: SidebarLinkProps) => {
  if (disabled) {
    return (
      <div className="flex items-center px-4 py-2 rounded-md font-medium text-sidebar-muted opacity-50 cursor-not-allowed">
        <span className="mr-3">{icon}</span>
        <span>{children}</span>
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
          isActive || active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{children}</span>
      {badge && (
        <Badge variant="destructive" className="ml-auto text-xs">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
};

export default SidebarLink;
